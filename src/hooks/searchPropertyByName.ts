import { supabase } from '@/lib/supabase';

export function searchPropertyByName(query: string) {

  console.log({"query on hook":query});


  const fetchPage = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return;
    }

        // Construction du filtre OR insensible à la casse
    const filter = `title.ilike.%${trimmedQuery}%,city.ilike.%${trimmedQuery}%,neighborhood.ilike.%${trimmedQuery}%`;

    const { data, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, price, city, neighborhood, photos_id, rooms_count, property_type').eq('id',1);

    console.log({"data":data});
  return  data;
  }
}