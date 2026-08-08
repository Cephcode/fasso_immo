import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

type NumberStepperProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

/** Compteur compact (icône + label + -/valeur/+), pensé pour tenir dans une grille 2 colonnes. */
export function NumberStepper({ icon, label, value, onChange, min = 0, max = 20 }: NumberStepperProps) {
  const colors = THEME.light;

  return (
    <View className="flex-1 gap-2 rounded-2xl bg-secondary p-3">
      <View className="flex-row items-center gap-1.5">
        <MaterialCommunityIcons name={icon} size={16} color={colors.mutedForeground} />
        <Text className="text-xs font-medium text-muted-foreground">{label}</Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => onChange(Math.max(min, value - 1))}
          hitSlop={8}
          className="h-7 w-7 items-center justify-center rounded-full bg-background"
        >
          <MaterialCommunityIcons name="minus" size={14} color={colors.foreground} />
        </Pressable>
        <Text className="text-base font-semibold text-foreground">{value}</Text>
        <Pressable
          onPress={() => onChange(Math.min(max, value + 1))}
          hitSlop={8}
          className="h-7 w-7 items-center justify-center rounded-full bg-background"
        >
          <MaterialCommunityIcons name="plus" size={14} color={colors.foreground} />
        </Pressable>
      </View>
    </View>
  );
}
