import { GlassBlurRoot, GlassSurface } from '@/components/ui/glass-view';
import { Input } from '@/components/ui/input';
import { NumberStepper } from '@/components/ui/number-stepper';
import { OptionPickerModal } from '@/components/ui/option-picker-modal';
import { Text } from '@/components/ui/text';
import { DEFAULT_LISTING_FILTERS, useListingFilters, type ListingFilters } from '@/hooks/useListingFilters';
import { useLocationOptions } from '@/hooks/useLocationOptions';
import { PROPERTY_TYPE_ICONS } from '@/lib/property-type-icons';
import { PROPERTY_TYPE_LABELS } from '@/lib/property-type-labels';
import { THEME } from '@/lib/theme';
import type { Post } from '@/types/listing';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PropertyType = Post['property_type'];
const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[];

const SORT_OPTIONS = [
  { value: null, label: 'Aucun' },
  { value: 'asc', label: 'Moins cher' },
  { value: 'desc', label: 'Plus cher' },
] as const;

function SectionLabel({ children }: { children: string }) {
  return <Text className="text-sm font-semibold text-foreground">{children}</Text>;
}

export default function FiltersScreen() {
  const colors = THEME.light;
  const insets = useSafeAreaInsets();
  const { filters, updateFilters } = useListingFilters();
  const { cities, neighborhoods } = useLocationOptions();

  const [draft, setDraft] = useState<ListingFilters>(filters);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [neighborhoodPickerOpen, setNeighborhoodPickerOpen] = useState(false);

  const patchDraft = (patch: Partial<ListingFilters>) => setDraft((d) => ({ ...d, ...patch }));

  const apply = () => {
    updateFilters(draft);
    router.back();
  };

  const reset = () => setDraft(DEFAULT_LISTING_FILTERS);

  const screenContent = (
    <>
      <View
        className="flex-row items-center gap-3 border-b border-border px-4 pb-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="h-10 w-10 items-center justify-center rounded-full bg-secondary"
        >
          <MaterialCommunityIcons name="close" size={20} color={colors.foreground} />
        </Pressable>
        <Text className="flex-1 text-lg font-bold tracking-tight text-foreground">Filtres</Text>
        <Pressable onPress={reset} hitSlop={8}>
          <Text className="text-sm font-medium text-primary">Réinitialiser</Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 22, paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2">
          <SectionLabel>Trier par loyer</SectionLabel>
          <View className="flex-row gap-2">
            {SORT_OPTIONS.map((opt) => {
              const active = draft.priceSort === opt.value;
              return (
                <Pressable
                  key={opt.label}
                  onPress={() => patchDraft({ priceSort: opt.value })}
                  className={
                    active ? 'flex-1 items-center rounded-full bg-primary py-2.5' : 'flex-1 items-center rounded-full bg-secondary py-2.5'
                  }
                >
                  <Text className={active ? 'text-sm font-semibold text-primary-foreground' : 'text-sm font-medium text-foreground'}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="flex-row gap-3">
          <Pressable onPress={() => setCityPickerOpen(true)} className="flex-1 gap-1 rounded-2xl bg-secondary p-3">
            <Text className="text-xs font-medium text-muted-foreground">Ville</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                {draft.city ?? 'Toutes'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color={colors.mutedForeground} />
            </View>
          </Pressable>
          <Pressable
            onPress={() => setNeighborhoodPickerOpen(true)}
            className="flex-1 gap-1 rounded-2xl bg-secondary p-3"
          >
            <Text className="text-xs font-medium text-muted-foreground">Quartier</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                {draft.neighborhood ?? 'Tous'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color={colors.mutedForeground} />
            </View>
          </Pressable>
        </View>

        <View className="gap-2">
          <SectionLabel>Type de bien</SectionLabel>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => patchDraft({ propertyType: null })}
              className={
                draft.propertyType === null ? 'rounded-full bg-primary px-4 py-2.5' : 'rounded-full bg-secondary px-4 py-2.5'
              }
            >
              <Text
                className={
                  draft.propertyType === null ? 'text-sm font-semibold text-primary-foreground' : 'text-sm font-medium text-foreground'
                }
              >
                Tous
              </Text>
            </Pressable>
            {PROPERTY_TYPES.map((type) => {
              const active = draft.propertyType === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => patchDraft({ propertyType: type })}
                  className={
                    active
                      ? 'flex-row items-center gap-1.5 rounded-full bg-primary px-4 py-2.5'
                      : 'flex-row items-center gap-1.5 rounded-full bg-secondary px-4 py-2.5'
                  }
                >
                  <MaterialCommunityIcons
                    name={PROPERTY_TYPE_ICONS[type]}
                    size={16}
                    color={active ? colors.primaryForeground : colors.mutedForeground}
                  />
                  <Text
                    className={
                      active ? 'text-sm font-semibold text-primary-foreground' : 'text-sm font-medium text-foreground'
                    }
                  >
                    {PROPERTY_TYPE_LABELS[type]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="gap-2">
          <SectionLabel>Loyer mensuel (FCFA)</SectionLabel>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                value={draft.priceMin != null ? String(draft.priceMin) : ''}
                onChangeText={(t) => patchDraft({ priceMin: t.trim() ? Number(t) : null })}
                placeholder="Min"
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Input
                value={draft.priceMax != null ? String(draft.priceMax) : ''}
                onChangeText={(t) => patchDraft({ priceMax: t.trim() ? Number(t) : null })}
                placeholder="Max"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View className="gap-2">
          <SectionLabel>Caractéristiques minimales</SectionLabel>
          <View className="flex-row gap-3">
            <NumberStepper
              icon="floor-plan"
              label="Pièces"
              value={draft.roomsMin ?? 0}
              onChange={(v) => patchDraft({ roomsMin: v > 0 ? v : null })}
            />
            <NumberStepper
              icon="bed-outline"
              label="Chambres"
              value={draft.bedroomsMin ?? 0}
              onChange={(v) => patchDraft({ bedroomsMin: v > 0 ? v : null })}
            />
          </View>
          <View className="flex-row gap-3">
            <NumberStepper
              icon="shower"
              label="Salles de bain"
              value={draft.bathroomsMin ?? 0}
              onChange={(v) => patchDraft({ bathroomsMin: v > 0 ? v : null })}
            />
            <NumberStepper
              icon="sofa-outline"
              label="Salons"
              value={draft.livingroomsMin ?? 0}
              onChange={(v) => patchDraft({ livingroomsMin: v > 0 ? v : null })}
            />
          </View>
          <View className="flex-row gap-3">
            <NumberStepper
              icon="garage-variant"
              label="Places garage"
              value={draft.garageCarsMin ?? 0}
              onChange={(v) => patchDraft({ garageCarsMin: v > 0 ? v : null })}
            />
            <View className="flex-1" />
          </View>
        </View>
      </ScrollView>
    </>
  );

  return (
    <GlassBlurRoot className="flex-1 bg-background" background={screenContent}>
      <View className="absolute bottom-0 left-0 right-0 px-4" style={{ paddingBottom: insets.bottom + 12 }}>
        <GlassSurface intensity="thick" className="flex-row gap-3 rounded-[26px] p-3">
          <Pressable onPress={apply} className="flex-1 items-center justify-center rounded-full bg-primary py-3">
            <Text className="font-semibold text-primary-foreground">Appliquer les filtres</Text>
          </Pressable>
        </GlassSurface>
      </View>

      <OptionPickerModal
        visible={cityPickerOpen}
        title="Choisir une ville"
        options={cities}
        value={draft.city}
        onSelect={(city) => patchDraft({ city })}
        onClose={() => setCityPickerOpen(false)}
      />
      <OptionPickerModal
        visible={neighborhoodPickerOpen}
        title="Choisir un quartier"
        options={neighborhoods}
        value={draft.neighborhood}
        onSelect={(neighborhood) => patchDraft({ neighborhood })}
        onClose={() => setNeighborhoodPickerOpen(false)}
      />
    </GlassBlurRoot>
  );
}
