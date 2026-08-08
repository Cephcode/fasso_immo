import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList, Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type OptionPickerModalProps = {
  visible: boolean;
  title: string;
  options: string[];
  value: string | null;
  onSelect: (value: string | null) => void;
  onClose: () => void;
  /** Libellé de l'entrée "aucune valeur" en tête de liste. */
  allLabel?: string;
};

/** Feuille de sélection unique générique — sert pour ville, quartier, etc. */
export function OptionPickerModal({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
  allLabel = 'Toutes',
}: OptionPickerModalProps) {
  const colors = THEME.light;
  const insets = useSafeAreaInsets();
  const rows: (string | null)[] = [null, ...options];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute bottom-0 left-0 right-0 top-0 bg-black/40" onPress={onClose} />
        <View
          className="max-h-[70%] gap-1 rounded-t-3xl bg-background p-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <Text className="px-1 pb-2 text-base font-semibold text-foreground">{title}</Text>
          <FlatList
            data={rows}
            keyExtractor={(item) => item ?? '__all__'}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const selected = item === value;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="flex-row items-center justify-between rounded-2xl px-3 py-3.5"
                >
                  <Text className={selected ? 'text-sm font-semibold text-primary' : 'text-sm text-foreground'}>
                    {item ?? allLabel}
                  </Text>
                  {selected && <MaterialCommunityIcons name="check" size={18} color={colors.primary} />}
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}
