import { OptionPickerModal } from '@/components/ui/option-picker-modal';
import { Text } from '@/components/ui/text';
import { useListingFilters } from '@/hooks/useListingFilters';
import { useLocationOptions } from '@/hooks/useLocationOptions';
import { THEME } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';

function FilterChip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  const colors = THEME.light;

  return (
    <Pressable
      onPress={onPress}
      className={
        active
          ? 'flex-row items-center self-start gap-1 rounded-full bg-primary px-2.5 py-1.5'
          : 'flex-row items-center self-start gap-1 rounded-full bg-secondary px-2.5 py-1.5'
      }
    >
      <MaterialCommunityIcons name={icon} size={12} color={active ? colors.primaryForeground : colors.mutedForeground} />
      <Text
        numberOfLines={1}
        className={active ? 'text-xs font-semibold text-primary-foreground' : 'text-xs font-medium text-foreground'}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Barre de filtres rapides sous le header de l'accueil : ville, tri par
 * loyer, quartier, et accès à l'écran "Plus de filtres". */
export function HomeFiltersBar() {
  const { filters, updateFilters, activeCount } = useListingFilters();
  const { cities, neighborhoods } = useLocationOptions();
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [neighborhoodPickerOpen, setNeighborhoodPickerOpen] = useState(false);

  const cyclePriceSort = () => {
    const next = filters.priceSort === null ? 'asc' : filters.priceSort === 'asc' ? 'desc' : null;
    updateFilters({ priceSort: next });
  };

  const priceSortIcon =
    filters.priceSort === 'asc' ? 'sort-ascending' : filters.priceSort === 'desc' ? 'sort-descending' : 'swap-vertical';

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ flexGrow: 0, alignItems: 'flex-start', gap: 6, paddingHorizontal: 16, paddingVertical: 8 }}
      >
        <FilterChip
          label={filters.city ?? 'Ville'}
          active={Boolean(filters.city)}
          onPress={() => setCityPickerOpen(true)}
          icon="city-variant-outline"
        />
        <FilterChip
          label="Loyer"
          active={filters.priceSort !== null}
          onPress={cyclePriceSort}
          icon={priceSortIcon}
        />
        <FilterChip
          label={filters.neighborhood ?? 'Quartier'}
          active={Boolean(filters.neighborhood)}
          onPress={() => setNeighborhoodPickerOpen(true)}
          icon="map-marker-outline"
        />
        <FilterChip
          label={activeCount > 0 ? `Filtres (${activeCount})` : 'Filtres'}
          active={activeCount > 0}
          onPress={() => router.push('/property/filters')}
          icon="tune-variant"
        />
      </ScrollView>

      <OptionPickerModal
        visible={cityPickerOpen}
        title="Choisir une ville"
        options={cities}
        value={filters.city}
        onSelect={(city) => updateFilters({ city })}
        onClose={() => setCityPickerOpen(false)}
      />
      <OptionPickerModal
        visible={neighborhoodPickerOpen}
        title="Choisir un quartier"
        options={neighborhoods}
        value={filters.neighborhood}
        onSelect={(neighborhood) => updateFilters({ neighborhood })}
        onClose={() => setNeighborhoodPickerOpen(false)}
      />
    </>
  );
}
