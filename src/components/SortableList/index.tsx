import { ReactNode, useEffect, useLayoutEffect, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { colors } from "../../shared/colors";

type ItemLayout = { y: number; height: number };

type DragState = {
  layouts: SharedValue<ItemLayout[]>;
  count: SharedValue<number>;
  activeIndex: SharedValue<number>;
  targetIndex: SharedValue<number>;
  dragY: SharedValue<number>;
};

type RenderItemInfo<T> = {
  item: T;
  index: number;
  /** Alça de arrasto: posicione onde quiser dentro do item. */
  dragHandle: ReactNode;
  /** `true` enquanto este item está sendo arrastado. */
  isDragging: boolean;
};

type SortableListProps<T> = {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (info: RenderItemInfo<T>) => ReactNode;
  /** Chamado ao soltar o item em outra posição. */
  onReorder: (from: number, to: number) => void;
  /** Avisa início/fim do toque na alça (ex.: travar o scroll da tela). */
  onDragStateChange?: (dragging: boolean) => void;
};

const SHIFT_ANIMATION = { duration: 150 };

/** Espaço vertical entre itens, medido do layout real (segue o `gap-*` da lista). */
function measuredGap(layouts: ItemLayout[]) {
  "worklet";
  if (layouts.length < 2 || !layouts[0] || !layouts[1]) return 0;
  return layouts[1].y - layouts[0].y - layouts[0].height;
}

/** Lista vertical que o usuário reordena arrastando a alça de cada item. */
export function SortableList<T>({
  data,
  keyExtractor,
  renderItem,
  onReorder,
  onDragStateChange,
}: SortableListProps<T>) {
  const layouts = useSharedValue<ItemLayout[]>([]);
  const count = useSharedValue(data.length);
  const activeIndex = useSharedValue(-1);
  const targetIndex = useSharedValue(-1);
  const dragY = useSharedValue(0);
  const [draggingIndex, setDraggingIndex] = useState(-1);

  useEffect(() => {
    count.value = data.length;
  }, [count, data.length]);

  // Depois que a nova ordem é renderizada, zera os deslocamentos de uma vez
  // (sem animação), para os itens não "pularem" duas vezes.
  useLayoutEffect(() => {
    activeIndex.value = -1;
    targetIndex.value = -1;
    dragY.value = 0;
    setDraggingIndex(-1);
  }, [data, activeIndex, targetIndex, dragY]);

  const state: DragState = { layouts, count, activeIndex, targetIndex, dragY };

  return (
    <View className="gap-2">
      {data.map((item, index) => (
        <SortableItem
          key={keyExtractor(item)}
          index={index}
          total={data.length}
          state={state}
          onReorder={onReorder}
          onDragStart={setDraggingIndex}
          onDragStateChange={onDragStateChange}
        >
          {(dragHandle) =>
            renderItem({
              item,
              index,
              dragHandle,
              isDragging: draggingIndex === index,
            })
          }
        </SortableItem>
      ))}
    </View>
  );
}

type SortableItemProps = {
  index: number;
  total: number;
  state: DragState;
  onReorder: (from: number, to: number) => void;
  onDragStart: (index: number) => void;
  onDragStateChange?: (dragging: boolean) => void;
  children: (dragHandle: ReactNode) => ReactNode;
};

function SortableItem({
  index,
  total,
  state,
  onReorder,
  onDragStart,
  onDragStateChange,
  children,
}: SortableItemProps) {
  const { layouts, count, activeIndex, targetIndex, dragY } = state;
  const itemIndex = useSharedValue(index);

  useEffect(() => {
    itemIndex.value = index;
  }, [itemIndex, index]);

  function handleLayout(event: LayoutChangeEvent) {
    const { y, height } = event.nativeEvent.layout;
    layouts.modify((list) => {
      "worklet";
      list[index] = { y, height };
      return list;
    });
  }

  function notifyDragging(dragging: boolean) {
    onDragStateChange?.(dragging);
  }

  const pan = usePanGesture({
    minDistance: 0,
    onBegin: () => {
      "worklet";
      scheduleOnRN(notifyDragging, true);
    },
    onActivate: () => {
      "worklet";
      const i = itemIndex.value;
      if (!layouts.value[i]) return;
      activeIndex.value = i;
      targetIndex.value = i;
      dragY.value = 0;
      scheduleOnRN(onDragStart, i);
    },
    onUpdate: (event) => {
      "worklet";
      const active = activeIndex.value;
      if (active === -1) return;
      const list = layouts.value;
      const n = Math.min(count.value, list.length);
      const current = list[active];
      const last = list[n - 1];

      // Não deixa o item sair dos limites da lista.
      const minY = -current.y;
      const maxY = last.y + last.height - (current.y + current.height);
      const y = Math.min(Math.max(event.translationY, minY), maxY);
      dragY.value = y;

      // Nova posição = itens cujo centro o centro do item arrastado ultrapassou.
      const center = current.y + current.height / 2 + y;
      let target = active;
      for (let i = active + 1; i < n; i++) {
        if (list[i] && center > list[i].y + list[i].height / 2) target = i;
      }
      for (let i = active - 1; i >= 0; i--) {
        if (list[i] && center < list[i].y + list[i].height / 2) target = i;
      }
      targetIndex.value = target;
    },
    onDeactivate: () => {
      "worklet";
      const active = activeIndex.value;
      if (active === -1) return;
      const target = targetIndex.value;
      const list = layouts.value;
      const gap = measuredGap(list);

      // Encaixa o item exatamente na vaga de destino antes de reordenar.
      let offset = 0;
      if (target > active) {
        for (let i = active + 1; i <= target; i++)
          offset += list[i].height + gap;
      } else {
        for (let i = target; i < active; i++) offset -= list[i].height + gap;
      }

      dragY.value = withTiming(offset, SHIFT_ANIMATION, (finished) => {
        "worklet";
        if (!finished) return;
        if (target !== active) {
          scheduleOnRN(onReorder, active, target);
        } else {
          activeIndex.value = -1;
          scheduleOnRN(onDragStart, -1);
        }
      });
    },
    onFinalize: () => {
      "worklet";
      scheduleOnRN(notifyDragging, false);
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const active = activeIndex.value;
    const i = itemIndex.value;

    if (active === -1) return { zIndex: 0, transform: [{ translateY: 0 }] };
    if (i === active) {
      return { zIndex: 10, transform: [{ translateY: dragY.value }] };
    }

    // Abre espaço para o item arrastado deslocando os vizinhos.
    const target = targetIndex.value;
    const draggedHeight = layouts.value[active]?.height ?? 0;
    const shift = draggedHeight + measuredGap(layouts.value);
    let offset = 0;
    if (active < target && i > active && i <= target) offset = -shift;
    else if (active > target && i >= target && i < active) offset = shift;

    return {
      zIndex: 0,
      transform: [{ translateY: withTiming(offset, SHIFT_ANIMATION) }],
    };
  });

  // Alternativa ao arrasto para leitores de tela.
  const accessibilityActions = [
    ...(index > 0 ? [{ name: "moveUp", label: "Mover para cima" }] : []),
    ...(index < total - 1
      ? [{ name: "moveDown", label: "Mover para baixo" }]
      : []),
  ];

  const dragHandle = (
    <GestureDetector gesture={pan}>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Arrastar para reordenar"
        accessibilityActions={accessibilityActions}
        onAccessibilityAction={({ nativeEvent }) => {
          if (nativeEvent.actionName === "moveUp") onReorder(index, index - 1);
          if (nativeEvent.actionName === "moveDown")
            onReorder(index, index + 1);
        }}
        hitSlop={8}
        className="h-8 w-8 items-center justify-center"
      >
        <MaterialIcons
          name="drag-indicator"
          size={22}
          color={colors.ink.muted}
        />
      </View>
    </GestureDetector>
  );

  return (
    <Animated.View style={animatedStyle} onLayout={handleLayout}>
      {children(dragHandle)}
    </Animated.View>
  );
}
