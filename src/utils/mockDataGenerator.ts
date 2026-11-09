import { Shop, MenuItem, User, MenuType } from '../types/index';

export interface RegionShopSpec {
  regionId: string;
  regionName: string;
  countryName: string;
  city: string;
  phonePrefix: string;
  currencySymbol: string;
  shops: Array<{
    name: string;
    bio: string;
    cuisineType: string;
    locationArea: string;
    address: string;
    avatarSeed: string;
    coverUrl?: string;
  }>;
}

// 15 Defined Regions with 21-22 Unique Curated Shops Each
export const REGION_SPECS: RegionShopSpec[] = [
  // 1. Yangon Region (Myanmar)
  {
    regionId: 'MM-YGN',
    regionName: 'Yangon Region',
    countryName: 'Myanmar',
    city: 'Yangon',
    phonePrefix: '+95 9',
    currencySymbol: '$',
    shops: [
      { name: 'Golden Rangoon Coconut Kitchen', bio: 'Specialist in traditional Ohn No Khao Swè, rich braised pork belly stews, and herbal seasonal sour soups.', cuisineType: 'Yangon Classic Curries & Soups', locationArea: 'Bahan Township', address: 'No. 42 Inya Road', avatarSeed: 'rangoon' },
      { name: 'Bogyoke Market Tea & Noodle House', bio: 'Heritage stall founded in 1968 inside Bogyoke Aung San Market serving iconic hand-pulled noodles.', cuisineType: 'Market Heritage Noodles', locationArea: 'Pabedan Township', address: 'Bogyoke Market Front Wing #14', avatarSeed: 'bogyoke' },
      { name: 'Shwedagon Vista Curry House', bio: 'Family dining facing the golden stupa with multi-tier curry platters, aromatic saffron rice, and soup.', cuisineType: 'Burmese Royal Curries', locationArea: 'Dagon Township', address: '12 U Wisara Road', avatarSeed: 'shwedagon' },
      { name: 'Inya Lake Burmese Kitchen', bio: 'Lakeside dining offering sour tamarind fish curries, crispy soft-shell crab, and crisp tea leaf salads.', cuisineType: 'Lakeside Casual Dining', locationArea: 'Mayangone Township', address: '88 Kaba Aye Pagoda Road', avatarSeed: 'inya' },
      { name: 'Downtown 19th Street Grill & Thoke', bio: 'The heartbeat of Yangon Chinatown night eats with charcoal grilled skewers and zesty salads.', cuisineType: 'Chinatown BBQ & Salads', locationArea: 'Latha Township', address: '45 19th Street', avatarSeed: 'street19' },
      { name: 'Sanchaung Heritage Breakfast Corner', bio: 'Neighborhood teahouse bustling with fresh Mohinga, piping hot samosas, and steamed pea naan.', cuisineType: 'Morning Teahouse Classics', locationArea: 'Sanchaung Township', address: '23 Shin Saw Pu Road', avatarSeed: 'sanchaung' },
      { name: 'Pansodan Art & Teahouse', bio: 'Colonial loft dining celebrating traditional Burmese breakfast bites and artisanal organic milk teas.', cuisineType: 'Artisanal Teahouse', locationArea: 'Kyauktada Township', address: '115 Pansodan Street', avatarSeed: 'pansodan' },
      { name: 'Chinatown Heritage Dim Sum & Mohinga', bio: 'Classic early morning noodle broth and freshly steamed sweet coconut treats in Old Yangon.', cuisineType: 'Old Yangon Fusion', locationArea: 'Lanmadaw Township', address: '78 Mahabandoola Road', avatarSeed: 'chinatown' },
      { name: 'Hledan Junction Street Eats', bio: 'Student favorite diner serving generous portions of Shan noodles, claypot meeshay, and faluda.', cuisineType: 'University Street Eats', locationArea: 'Kamayut Township', address: '55 Hledan Road', avatarSeed: 'hledan' },
      { name: 'Kandawgyi Palace Spice Kitchen', bio: 'Traditional slow-simmered duck curries and dried fish dips overlooking Kandawgyi Nature Park.', cuisineType: 'Parkside Heritage Dining', locationArea: 'Mingalar Taungnyunt', address: 'Kan Yeik Tha Road', avatarSeed: 'kandawgyi' },
      { name: 'Yankin Noodle Lounge', bio: 'Contemporary Burmese noodle parlor specializing in Danbauk biryani and cold rice noodle salads.', cuisineType: 'Modern Burmese Noodles', locationArea: 'Yankin Township', address: '14 Yan Shin Road', avatarSeed: 'yankin' },
      { name: 'Sule Pagoda Roadway Teahouse', bio: 'Historic downtown tea stop famed for strong sweetened tea and crispy split-pea fritters.', cuisineType: 'Downtown Street Teahouse', locationArea: 'Kyauktada Township', address: '320 Sule Pagoda Road', avatarSeed: 'sule' },
      { name: 'Tamwe Spice Bazaar Kitchen', bio: 'Bustling home kitchen preparing rich mutton curries, tamarind leaf soups, and spicy fish cakes.', cuisineType: 'Home-Style Curries', locationArea: 'Tamwe Township', address: '67 Kyaik Ka San Road', avatarSeed: 'tamwe' },
      { name: 'Ahlone Riverview Curry House', bio: 'Riverside dining featuring fresh river catfish Mohinga and tender slow-simmered beef cheek curry.', cuisineType: 'Riverview Curries', locationArea: 'Ahlone Township', address: '8 Lower Kyimyindaing Road', avatarSeed: 'ahlone' },
      { name: 'Kyeemyindaing Fish Broth House', bio: 'Renowned for thick lemongrass catfish broth, boiled quail eggs, and crispy yellow pea crackers.', cuisineType: 'Mohinga Specialists', locationArea: 'Kyeemyindaing Township', address: '102 Pan Hlaing Street', avatarSeed: 'kyeemyindaing' },
      { name: 'North Dagon Pe-Kyaw Corner', bio: 'Suburban morning hub with endless trays of freshly fried gourd fritters and sticky rice cakes.', cuisineType: 'Traditional Snacks & Fritters', locationArea: 'North Dagon Township', address: 'Block 28, Pinlon Road', avatarSeed: 'northdagon' },
      { name: 'South Okkalapa Traditional Noodles', bio: 'Authentic Rakhine Mont Di and sour spicy fish broth noodles served with roasted bird’s eye chili.', cuisineType: 'Rakhine Spiced Broths', locationArea: 'South Okkalapa', address: 'Corner of 4th Street', avatarSeed: 'southokkalapa' },
      { name: 'Thingangyun Grandma’s Curry Pot', bio: 'Generational recipes simmered in terracotta pots with golden turmeric oil and shallots.', cuisineType: 'Heritage Claypot Curries', locationArea: 'Thingangyun Township', address: '88 Lay Daungkan Road', avatarSeed: 'thingangyun' },
      { name: 'Dawbon Riverside Breakfast Bar', bio: 'Morning favorite on the river bank featuring coconut chicken noodles and fresh avocado shakes.', cuisineType: 'Riverside Breakfast', locationArea: 'Dawbon Township', address: '19 Yamona Street', avatarSeed: 'dawbon' },
      { name: 'Botataung Jetty Seafood & Mohinga', bio: 'Portside market diner serving aromatic river prawn curries and fresh ginger salads.', cuisineType: 'Portside Kitchen', locationArea: 'Botataung Township', address: 'Strand Road Pier 4', avatarSeed: 'botataung' },
      { name: 'Star City Heritage Kitchen', bio: 'Modern residential tea lounge with clean seating, organic Shan tea leaves, and halal curries.', cuisineType: 'Modern Heritage Food', locationArea: 'Thanlyin Bridge Area', address: 'Star City Boulevard', avatarSeed: 'starcity' },
      { name: 'Royal Golden Lake Teahouse', bio: 'Sprawling outdoor morning garden famous for Burmese paratha, mutton soup, and hot sweet milk tea.', cuisineType: 'Garden Teahouse', locationArea: 'Bahan Township', address: '5 Shwe Taung Gyar Street', avatarSeed: 'goldenlake' },
    ],
  },

  // 2. Mandalay Region (Myanmar)
  {
    regionId: 'MM-MDY',
    regionName: 'Mandalay Region',
    countryName: 'Myanmar',
    city: 'Mandalay',
    phonePrefix: '+95 9',
    currencySymbol: '$',
    shops: [
      { name: 'Mandalay Morning Teahouse', bio: 'Authentic royal Mandalay breakfast, slow-cooked catfish Mohinga, and handcrafted freshly fried crispy split-pea fritters.', cuisineType: 'Burmese Breakfast & Street Classics', locationArea: 'Downtown Heritage District', address: '78th Street, Between 26th & 27th', avatarSeed: 'mandalay' },
      { name: 'Royal Palace Moat Tea Corner', bio: 'Scenic breakfast tables along the ancient brick fortress moat with crisp samosas and hot tea.', cuisineType: 'Palace Moat Teahouse', locationArea: 'Aungmyethazan', address: '66th Street, North Moat', avatarSeed: 'palacemoat' },
      { name: 'Mahamuni Gold Noodle Bar', bio: 'Famous pilgrimage destination serving Nan Gyi Thoke tossed in roasted gram flour and spiced oil.', cuisineType: 'Pilgrim Noodle House', locationArea: 'Chanayethazan', address: '84th Street near Pagoda Gate', avatarSeed: 'mahamuni' },
      { name: 'Amarapura Silk Weaver’s Kitchen', bio: 'Rustic wooden dining near U Bein Bridge with river fish curries and pickled mango salads.', cuisineType: 'Artisan Village Dining', locationArea: 'Amarapura', address: 'U Bein Bridge East Pier', avatarSeed: 'amarapura' },
      { name: 'Zay Cho Central Market Noodle Stall', bio: 'The historic culinary centerpiece of Mandalay market traders serving steaming Mont Di bowls.', cuisineType: 'Central Bazaar Bites', locationArea: 'Chanayethazan', address: 'Zay Cho Market Section C', avatarSeed: 'zaycho' },
      { name: 'Mingun Bell Riverview Diner', bio: 'Upriver ferry stop kitchen offering sweet Mandalay rice cakes, jaggery sweets, and sour bamboo soup.', cuisineType: 'Riverboat Kitchen', locationArea: 'Mingun Pier', address: 'Mingun Jetty Road', avatarSeed: 'mingun' },
      { name: 'Pyin Oo Lwin Highland Strawberry & Tea', bio: 'Cool colonial hill-station teahouse serving fresh highland butter, warm buns, and Shan coffee.', cuisineType: 'Highland Hill Cafe', locationArea: 'Pyin Oo Lwin', address: 'Circular Road, Near Clock Tower', avatarSeed: 'pyinoolwin' },
      { name: 'Chanayethazan Morning Kitchen', bio: 'Traditional home-cooked breakfast featuring yellow pea sticky rice and shredded beef floss.', cuisineType: 'Downtown Breakfast', locationArea: 'Chanayethazan', address: '30th Street, 74th Corner', avatarSeed: 'chanayethazan' },
      { name: 'Maha Aungmye Nan Gyi Thoke House', bio: 'Thick handcrafted rice noodles bathed in golden chicken oil with boiled duck eggs and lime.', cuisineType: 'Nan Gyi Specialists', locationArea: 'Maha Aungmye', address: '35th Street & 71st', avatarSeed: 'mahaaungmye' },
      { name: 'Pyigyitagon Pe-Byouk Breakfast Lounge', bio: 'Neighborhood favorite for hot baked naan breads dipped in savory seasoned yellow peas.', cuisineType: 'Naan & Pea Bakery', locationArea: 'Pyigyitagon', address: '73rd Street Industrial Hub', avatarSeed: 'pyigyitagon' },
      { name: 'Aungmyethazan Royal Sweet Tea', bio: 'Centuries of brewing expertise in authentic layered condensed milk teas and crispy pastries.', cuisineType: 'Royal Heritage Tea', locationArea: 'Aungmyethazan', address: '19th Street Moat Corner', avatarSeed: 'aungmyethazan' },
      { name: 'Sagaing Hills Viewpoint Kitchen', bio: 'Vegetarian monastery curries, fried tofu fritters, and crisp river weed salad with sesame.', cuisineType: 'Monastic Vegetarian', locationArea: 'Sagaing Bridge Gateway', address: 'Sagaing Viewpoint Point 1', avatarSeed: 'sagaing' },
      { name: '73rd Street Spiced Biryani House', bio: 'Mughal-Burmese heritage spiced basmati rice with tender braised chicken and mint chutney.', cuisineType: 'Burmese Danbauk Biryani', locationArea: 'Downtown Mandalay', address: '73rd Street, Between 37th & 38th', avatarSeed: 'biryani73' },
      { name: 'Diamond Plaza Burmese Noodle Hub', bio: 'Comfortable air-conditioned restaurant with full regional sets from all parts of Upper Burma.', cuisineType: 'Upper Burma Regional', locationArea: 'Chanayethazan', address: 'Diamond Plaza Level 2', avatarSeed: 'diamondplaza' },
      { name: 'Yadanarbon University Street Eats', bio: 'Budget friendly and flavor packed noodle bowls, crunchy tea leaf snacks, and iced coolers.', cuisineType: 'Student Street Hub', locationArea: 'Maha Aungmye', address: '62nd Street Campus Row', avatarSeed: 'yadanarbon' },
      { name: 'Sein Pan Market Home Curry', bio: 'Fresh daily curries cooked by matriarch Daw Tin Tin with locally caught Irrawaddy fish.', cuisineType: 'Bazaar Home Cooking', locationArea: 'Sein Pan Ward', address: 'Sein Pan 8th Road', avatarSeed: 'seinpan' },
      { name: 'Nan Shae Palace Gate Eatery', bio: 'East gate garden stop offering herbal sour soups, braised eggplant, and spicy dried beef.', cuisineType: 'Palace Gate Diner', locationArea: 'Nan Shae Ward', address: '12th Street East Gate', avatarSeed: 'nanshae' },
      { name: 'Myo Haung Old Station Kitchen', bio: 'Generous portions of fried noodles, chicken skewers, and aromatic tea for travelers.', cuisineType: 'Railway Heritage Diner', locationArea: 'Old Station Area', address: 'Railway Road South', avatarSeed: 'myohaung' },
      { name: 'Shwe Kyin Monastery Tea Garden', bio: 'Quiet shaded courtyard serving herbal teas, boiled groundnuts, and sweet palm sugar pancakes.', cuisineType: 'Monastery Tea Garden', locationArea: 'Mandalay Hill Base', address: 'Hill Pilgrimage Road', avatarSeed: 'shwekyin' },
      { name: 'Kyauk Taw Gyi Marble Carver’s Diner', bio: 'Hearty meals for stonemasons and visitors: spicy pork stews and garlic potato fritters.', cuisineType: 'Artisan Workshop Diner', locationArea: 'Marble Village', address: 'Marble Carver Quarter', avatarSeed: 'kyauktawgyi' },
      { name: 'Chanmyathazi Airport Road Diner', bio: 'Highway travelers choice for hot mohinga, coconut rice, and iced fresh fruit juices.', cuisineType: 'Highway Express Kitchen', locationArea: 'Chanmyathazi', address: 'Old Airport Highway 1', avatarSeed: 'airportroad' },
      { name: 'Shwe Mann Heritage Breakfast', bio: 'Signature Mandalay breakfast noodles served with crispy wontons and garlic pickled chili broth.', cuisineType: 'Heritage Breakfast Stall', locationArea: 'Downtown', address: '80th Street, 28th Corner', avatarSeed: 'shwemann' },
    ],
  },

  // 3. Shan State (Myanmar)
  {
    regionId: 'MM-SHN',
    regionName: 'Shan State',
    countryName: 'Myanmar',
    city: 'Taunggyi',
    phonePrefix: '+95 9',
    currencySymbol: '$',
    shops: [
      { name: 'Inle Mountain Tealeaf Corner', bio: 'Highland Shan cuisine featuring fermented tea leaf salad, warm Shan tofu noodle bowls, and savory rice cakes.', cuisineType: 'Shan Highlands & Vegetarian Delights', locationArea: 'Inle Lake Market Hub', address: 'Main Market Pier', avatarSeed: 'inle' },
      { name: 'Taunggyi Highland Noodle House', bio: 'Iconic cool-weather rice ribbon noodles tossed with spicy minced chicken, sesame, and pickled greens.', cuisineType: 'Taunggyi Traditional Noodles', locationArea: 'Taunggyi City Center', address: 'Main Circular Road #18', avatarSeed: 'taunggyi' },
      { name: 'Kalaw Pine Forest Shan Kitchen', bio: 'Trekking capital favorite offering organic mountain vegetable curries and roasted sesame tofu.', cuisineType: 'Pine Forest Hill Dining', locationArea: 'Kalaw Station Ward', address: 'Old Railway Road', avatarSeed: 'kalaw' },
      { name: 'Pindaya Cave Organic Tea Lounge', bio: 'High-elevation tea plantation leaves hand-rolled with crushed garlic, roasted peanuts, and lime.', cuisineType: 'Organic Mountain Teas', locationArea: 'Pindaya Lake', address: 'Pagoda Cave Approach Road', avatarSeed: 'pindaya' },
      { name: 'Lashio Night Market BBQ & Meeshay', bio: 'Northern Shan claypot meeshay and sizzling mountain herb skewers seasoned with local peppers.', cuisineType: 'Northern Shan Night Market', locationArea: 'Lashio Central', address: 'Downtown Night Bazaar #4', avatarSeed: 'lashio' },
      { name: 'Hopong Golden Valley Tofu House', bio: 'Artisanal yellow chickpea tofu made fresh daily using pure limestone mountain spring water.', cuisineType: 'Artisanal Tofu Specialists', locationArea: 'Hopong Valley', address: 'Valley Highway Road', avatarSeed: 'hopong' },
      { name: 'Nyaungshwe Lotus Canal Eatery', bio: 'Canalside cafe serving Shan sticky rice balls, grilled Inle Lake tilapia, and herbal soups.', cuisineType: 'Canalside Dining', locationArea: 'Nyaungshwe', address: 'Ywama Canal Pier', avatarSeed: 'lotuscanal' },
      { name: 'Taunggyi Viewpoint Shan Hotpot', bio: 'Steaming claypot broths infused with mountain coriander, hand-shaved noodles, and tender beef.', cuisineType: 'Highland Claypot Hotpot', locationArea: 'Scenic Viewpoint', address: 'Viewpoint Ridge Road', avatarSeed: 'viewpoint' },
      { name: 'Inle Floating Gardens Organic Kitchen', bio: 'Dishes prepared with freshly plucked hydroponic lake tomatoes, mint, and crisp local greens.', cuisineType: 'Floating Garden Fresh', locationArea: 'Inle Lake Center', address: 'Floating Island Village #3', avatarSeed: 'floatinggardens' },
      { name: 'Mine Thauk Wooden Bridge Dining', bio: 'Half on land, half on water rustic kitchen offering crispy fried lake fish and sour bamboo curries.', cuisineType: 'Lakeside Wooden Bridge', locationArea: 'Mine Thauk Village', address: 'Bridge Footpath West', avatarSeed: 'minethauk' },
      { name: 'Aythaya Vineyard Shan Fusion Kitchen', bio: 'Overlooking sunset vineyards with modern interpretations of Shan chicken stews and cheeses.', cuisineType: 'Shan Fusion Dining', locationArea: 'Aythaya Estate', address: 'Vineyard Hill Top', avatarSeed: 'aythaya' },
      { name: 'Shwe Yan Pyay Monastic Tea House', bio: 'Traditional quiet teahouse beside the heritage wooden monastery serving roasted green teas.', cuisineType: 'Heritage Monastery Teas', locationArea: 'Nyaungshwe Gateway', address: 'Heritage Roadway', avatarSeed: 'shweyanpyay' },
      { name: 'Aungban Potato & Shan Noodle Hub', bio: 'The wholesale trading hub serving crispy fried potato hash cakes and steaming Shan noodle soup.', cuisineType: 'Market Hub Breakfast', locationArea: 'Aungban Central', address: 'Potato Depot Boulevard', avatarSeed: 'aungban' },
      { name: 'Panglong Peace Unity Curry House', bio: 'Historic landmark town diner celebrating recipes from all Shan ethnic groups under one roof.', cuisineType: 'Pan-Shan Ethnic Cuisine', locationArea: 'Panglong Monument', address: 'Unity Road #7', avatarSeed: 'panglong' },
      { name: 'Hpa-an Gateway Shan Cafe', bio: 'Highway transit hub preparing warming morning noodle soups and sweet mountain honey toast.', cuisineType: 'Mountain Pass Diner', locationArea: 'Transit Gateway', address: 'Highway 4 Junction', avatarSeed: 'gateway' },
      { name: 'Namkham Northern Shan Kitchen', bio: 'Fiery roasted mountain chili dips, fermented pork patties, and sour wild green leaf soups.', cuisineType: 'Northern Frontier Food', locationArea: 'Namkham Town', address: 'Main Street #12', avatarSeed: 'namkham' },
      { name: 'Kyaukme Mountain Tea Leaf Press', bio: 'Direct-from-grower fermented tea leaves tossed with toasted heirloom sesame and crisp split peas.', cuisineType: 'Tea Leaf Producers', locationArea: 'Kyaukme Central', address: 'Tea Grower Market Row', avatarSeed: 'kyaukme' },
      { name: 'Hsipaw Royal Shan Palace Diner', bio: 'Royal Shan Palace recipes passed down through generations: mild chicken noodle stews and sweets.', cuisineType: 'Palace Heritage Dining', locationArea: 'Hsipaw Town', address: 'Palace Road South', avatarSeed: 'hsipaw' },
      { name: 'Muse Borderlands Noodle Emporium', bio: 'Vibrant cross-border fusion noodles, spicy meat sauces, and crisp dumplings in northern Shan.', cuisineType: 'Borderland Fusion', locationArea: 'Muse Center', address: 'Friendship Avenue', avatarSeed: 'muse' },
      { name: 'Nampan Market 5-Day Bazaar Stall', bio: 'Rotating market vendor famed for warm freshly pulled tofu noodles and sweet jaggery cakes.', cuisineType: 'Rotating Bazaar Bites', locationArea: 'Nampan Southern Inle', address: '5-Day Market Pier', avatarSeed: 'nampan' },
      { name: 'Khaung Daing Hot Springs Breakfast', bio: 'Post-soak morning comfort food: steaming catfish noodles, boiled organic eggs, and ginger tea.', cuisineType: 'Hot Spring Retreat', locationArea: 'Khaung Daing Village', address: 'Thermal Springs Road', avatarSeed: 'khaungdaing' },
      { name: 'Green Lake Shan Tofu Villa', bio: 'Garden setting dedicated to all styles of Shan tofu: steamed, crispy fried, cold tossed, and warm soup.', cuisineType: 'Tofu Villa Specialists', locationArea: 'Taunggyi Outskirts', address: 'Green Lake Lane 4', avatarSeed: 'greenlake' },
    ],
  },

  // 4. Bago Region (Myanmar)
  {
    regionId: 'MM-BGO',
    regionName: 'Bago Region',
    countryName: 'Myanmar',
    city: 'Bago',
    phonePrefix: '+95 9',
    currencySymbol: '$',
    shops: [
      { name: 'Shwemawdaw Pagoda View Teahouse', bio: 'Historic pilgrimage teahouse serving Bago-style sweet milk tea and fresh golden samosas.', cuisineType: 'Bago Pilgrim Teahouse', locationArea: 'Pagoda West Gate', address: 'Shwemawdaw Pagoda Road', avatarSeed: 'shwemawdaw' },
      { name: 'Hanthawaddy Royal Kitchen', bio: 'Mon-Burmese fusion dishes, slow-braised duck in spiced coconut gravy, and fresh bamboo shoots.', cuisineType: 'Mon-Burmese Heritage', locationArea: 'Old Royal Palace', address: 'Hanthawaddy Road #8', avatarSeed: 'hanthawaddy' },
      { name: 'Pyay Shwesandaw Noodle Stall', bio: 'Famous Pyay-style rice noodle soup with sun-dried freshwater shrimp and roasted garlic oil.', cuisineType: 'Pyay Regional Noodles', locationArea: 'Pyay Riverside', address: 'Strand Road, Pyay', avatarSeed: 'pyay' },
      { name: 'Toungoo Teak Valley Diner', bio: 'Forest valley home cooking with spiced wild game curries, river fish, and crunchy green mango salad.', cuisineType: 'Forest Valley Cooking', locationArea: 'Toungoo Old Town', address: 'Teak Forest Road #15', avatarSeed: 'toungoo' },
      { name: 'Kyaikto Gateway Curry Rest', bio: 'Pilgrim highway rest stop famous for tender goat curry, fresh lime soup, and fried peas.', cuisineType: 'Highway Pilgrim Dining', locationArea: 'Kyaikto Junction', address: 'Golden Rock Highway', avatarSeed: 'kyaikto' },
      { name: 'Shwethalyaung Reclining Buddha Diner', bio: 'Peaceful garden diner offering cooling grass jelly desserts and hearty catfish mohinga.', cuisineType: 'Garden Mohinga Stall', locationArea: 'Buddha Sanctuary', address: 'Reclining Buddha Road', avatarSeed: 'shwethalyaung' },
      { name: 'Bago River Fish Broth House', bio: 'Fresh daily catch from Bago River simmered with shallots, lemongrass, and split pea cakes.', cuisineType: 'River Fish Broths', locationArea: 'Bago Riverfront', address: 'River Pier 2', avatarSeed: 'bagoriver' },
      { name: 'Kalyani Sima Monastic Tea Corner', bio: 'Vegetarian snacks, puffed rice treats, and spiced black tea brewed fresh every dawn.', cuisineType: 'Monastic Teahouse', locationArea: 'Sima Grounds', address: 'Kalyani Road', avatarSeed: 'kalyani' },
      { name: 'Pyay Night Bazaar Grills & Thoke', bio: 'Lively evening stalls serving roasted fish, crunchy tea leaf salads, and spicy dip platters.', cuisineType: 'Night Market Thoke', locationArea: 'Pyay Central Market', address: 'Pyay Bazaar Row #9', avatarSeed: 'pyaybazaar' },
      { name: 'Nyaunglebin Golden Paddy Diner', bio: 'Farmstead home cooking featuring fresh organic rice, sweet mustard greens, and country chicken.', cuisineType: 'Farmstead Home Cooking', locationArea: 'Nyaunglebin', address: 'Paddy Road Junction', avatarSeed: 'nyaunglebin' },
      { name: 'Daik-U Highway Breakfast Hub', bio: 'Morning traveler favorite for steamed sticky rice with boiled vatana peas and crispy dough fritters.', cuisineType: 'Express Morning Hub', locationArea: 'Daik-U Toll Way', address: 'Yangon-Mandalay Expressway', avatarSeed: 'daiku' },
      { name: 'Thanatpin Fishermen’s Kitchen', bio: 'Spicy fermented fish curries and fresh river greens harvested from the delta canals.', cuisineType: 'Canal Fishermen Food', locationArea: 'Thanatpin Canal', address: 'Waterfront Path 3', avatarSeed: 'thanatpin' },
      { name: 'Waw Golden Harvest Noodle Bar', bio: 'Rich chicken noodle bowls flavored with roasted chickpea flour and sweet crisp shallots.', cuisineType: 'Harvest Rice Noodles', locationArea: 'Waw Township', address: 'Harvest Street #4', avatarSeed: 'waw' },
      { name: 'Kawa River Delta Dining', bio: 'Crispy fried river prawns, sweet sour mango salads, and traditional steamed duck rice.', cuisineType: 'Delta River Seafood', locationArea: 'Kawa Riverbank', address: 'Pier Approach', avatarSeed: 'kawa' },
      { name: 'Shwedaung Noodle Heritage House', bio: 'Home of the original Shwedaung noodles served in a rich coconut turmeric chicken gravy.', cuisineType: 'Shwedaung Specialties', locationArea: 'Shwedaung Town', address: 'Old Highway Gate', avatarSeed: 'shwedaung' },
      { name: 'Paungde Silk Road Kitchen', bio: 'Traditional spiced curries and fresh seasonal vegetable soups cooked over open wood fires.', cuisineType: 'Wood-Fired Curries', locationArea: 'Paungde Central', address: 'Market Road #2', avatarSeed: 'paungde' },
      { name: 'Thegon Countryside Teahouse', bio: 'Rustic bamboo teahouse known for rich dark tea, sweet coconut pancakes, and butter toast.', cuisineType: 'Rustic Country Teas', locationArea: 'Thegon Rural', address: 'Village Square', avatarSeed: 'thegon' },
      { name: 'Padaung Mountain View Diner', bio: 'Spicy mountain bamboo shoot curries and roasted sesame chicken cooked in traditional clay pots.', cuisineType: 'Mountain Ridge Diner', locationArea: 'Padaung Hills', address: 'Hills Road 1', avatarSeed: 'padaung' },
      { name: 'Yedashe Teak Road Bistro', bio: 'Generous bowls of beef noodle soup, pickled cabbage, and fresh tamarind drinks for drivers.', cuisineType: 'Highway Transit Bistro', locationArea: 'Yedashe Station', address: 'Main Transit Way', avatarSeed: 'yedashe' },
      { name: 'Oktwin Rice Bowl Corner', bio: 'Warm rice bowls topped with caramelized pork belly, sweet shallots, and spicy balachaung.', cuisineType: 'Comfort Rice Bowls', locationArea: 'Oktwin Bazaar', address: 'Depot Street', avatarSeed: 'oktwin' },
      { name: 'Kyauktaga Riverview Breakfast', bio: 'Early morning river breeze accompanied by hot catfish soup and crispy yellow pea crackers.', cuisineType: 'Riverview Breakfast', locationArea: 'Kyauktaga Pier', address: 'River Ferry Way', avatarSeed: 'kyauktaga' },
    ],
  },

  // 5. Ayeyarwady Region (Myanmar)
  {
    regionId: 'MM-AYY',
    regionName: 'Ayeyarwady Region',
    countryName: 'Myanmar',
    city: 'Pathein',
    phonePrefix: '+95 9',
    currencySymbol: '$',
    shops: [
      { name: 'Pathein Halawa & Breakfast Haven', bio: 'The birthplace of authentic Pathein Halawa sweet sticky rice cake, served with rich morning tea.', cuisineType: 'Pathein Confections & Breakfast', locationArea: 'Downtown Pathein', address: 'Merchant Street #50', avatarSeed: 'pathein' },
      { name: 'Ngwesaung Beachside Curry Shack', bio: 'Freshly caught coastal prawns, crabs, and fish prepared in fragrant coconut oil and ginger.', cuisineType: 'Coastal Seafood Curries', locationArea: 'Ngwesaung Beach', address: 'Silver Beach Road #12', avatarSeed: 'ngwesaung' },
      { name: 'Chaungtha Ocean Breeze Mohinga', bio: 'Unique coastal fish broth Mohinga prepared with fresh sea snapper and crunchy split-pea crackers.', cuisineType: 'Coastal Fish Mohinga', locationArea: 'Chaungtha Beach', address: 'Ocean Drive Row #4', avatarSeed: 'chaungtha' },
      { name: 'Hinthada Riverside Tea Bar', bio: 'Historic delta port teahouse offering aromatic steamed sticky rice and freshly fried gourd fritters.', cuisineType: 'Delta Riverside Teahouse', locationArea: 'Hinthada Riverfront', address: 'Strand Road Pier 1', avatarSeed: 'hinthada' },
      { name: 'Myaungmya Claypot Noodle House', bio: 'Renowned Myaungmya Mohinga recipe with thick catfish broth, banana stem, and roasted chili.', cuisineType: 'Myaungmya Mohinga Specialists', locationArea: 'Myaungmya Central', address: 'Main Market Road #18', avatarSeed: 'myaungmya' },
      { name: 'Labutta Mangrove Seafood Diner', bio: 'Giant mud crabs, spiced delta prawns, and sour tamarind fish stews from the outer mangrove canals.', cuisineType: 'Mangrove Delta Seafood', locationArea: 'Labutta Port', address: 'Harbor Quay Road', avatarSeed: 'labutta' },
      { name: 'Pyapon Fish Paste & Curry Kitchen', bio: 'Home of the finest Ngapi fish dips, served alongside twenty varieties of fresh crisp vegetables.', cuisineType: 'Traditional Delta Ngapi', locationArea: 'Pyapon Old Town', address: 'Fish Wharf Road #2', avatarSeed: 'pyapon' },
      { name: 'Bogale Riverboat Transit Diner', bio: 'Hearty bowls of chicken coconut noodles and spicy samosa soups for travelers riding delta ferries.', cuisineType: 'Riverboat Traveler Hub', locationArea: 'Bogale Pier', address: 'Ferry Terminal Gate 3', avatarSeed: 'bogale' },
      { name: 'Maubin Fish Farming Stew House', bio: 'Freshwater fish cooked with sour roselle leaves, green chili, and roasted shallots in clay bowls.', cuisineType: 'Freshwater Fish Curries', locationArea: 'Maubin Island', address: 'Island Highway 1', avatarSeed: 'maubin' },
      { name: 'Kyaiklat Saffron Rice & Tea', bio: 'Fragrant saffron infused rice paired with slow-braised beef curry and crisp cucumber relish.', cuisineType: 'Delta Saffron Rice', locationArea: 'Kyaiklat Downtown', address: 'Market Lane #5', avatarSeed: 'kyaiklat' },
      { name: 'Dedaye Coconut Grove Teahouse', bio: 'Shaded coconut orchard teahouse serving fresh coconut milk tea and steamed glutinous rice.', cuisineType: 'Coconut Grove Dining', locationArea: 'Dedaye Country', address: 'Orchard Path #8', avatarSeed: 'dedaye' },
      { name: 'Wakema Waterway Breakfast Bar', bio: 'Early morning floating sampan kitchen serving piping hot mohinga directly to wooden jetties.', cuisineType: 'Waterway Floating Kitchen', locationArea: 'Wakema Canals', address: 'Central Jetty Pier', avatarSeed: 'wakema' },
      { name: 'Yandoon Riverside Noodle Shack', bio: 'Crispy fried fish balls and thin vermicelli tossed with garlic oil and dried shrimp flakes.', cuisineType: 'Riverfront Noodle Shack', locationArea: 'Yandoon River', address: 'Riverfront Walkway', avatarSeed: 'yandoon' },
      { name: 'Danubyu General Bandula Curry House', bio: 'Historic garrison town diner known for robust slow-cooked mutton stews and spiced lentil soups.', cuisineType: 'Garrison Spiced Curries', locationArea: 'Danubyu Old Town', address: 'Bandula Road', avatarSeed: 'danubyu' },
      { name: 'Zalun Pyi Taw Pyan Temple Diner', bio: 'Pilgrimage stop famous for vegetarian lentil curries, sweet semolina cakes, and green tea.', cuisineType: 'Temple Pilgrim Eats', locationArea: 'Zalun Pagoda', address: 'Temple Approach Way', avatarSeed: 'zalun' },
      { name: 'Ingapu Lemon Farm Kitchen', bio: 'Zesty citrus chicken soups, tangy fresh herb salads, and grilled river fish with lemon chili dip.', cuisineType: 'Citrus Delta Kitchen', locationArea: 'Ingapu Fields', address: 'Lemon Grove Road', avatarSeed: 'ingapu' },
      { name: 'Kyangin Lime Mountain Dining', bio: 'Limestone valley diner serving mountain potato fritters and rich coconut chicken broth noodles.', cuisineType: 'Valley Noodle Lounge', locationArea: 'Kyangin Hills', address: 'Hills Road #4', avatarSeed: 'kyangin' },
      { name: 'Myanaung Riverbend Curry Pot', bio: 'Generous portions of slow-braised pork belly and pickled mustard green soups for boatmen.', cuisineType: 'Boatmen River Curries', locationArea: 'Myanaung Bend', address: 'Riverbend Pier', avatarSeed: 'myanaung' },
      { name: 'Hainggyi Island Ocean Feast', bio: 'Remote island seafood: charcoal grilled lobster, tamarind mackerel curry, and coconut rice.', cuisineType: 'Island Seafood Shack', locationArea: 'Hainggyi Island', address: 'Ocean Pier #1', avatarSeed: 'hainggyi' },
      { name: 'Ngapudaw River Pearl Kitchen', bio: 'Crispy split-pea cakes and hearty river fish Mohinga made fresh every morning at 5:00 AM.', cuisineType: 'Early Dawn Mohinga', locationArea: 'Ngapudaw Pier', address: 'Pearl Riverway', avatarSeed: 'ngapudaw' },
      { name: 'Kangyidaunt Green Paddy Diner', bio: 'Village teahouse overlooking emerald green paddy fields serving sweet milk tea and fried naan.', cuisineType: 'Paddy View Teahouse', locationArea: 'Kangyidaunt', address: 'Paddy Village Road', avatarSeed: 'kangyidaunt' },
    ],
  },

  // 6. Bangkok Metropolitan (Thailand)
  {
    regionId: 'TH-BKK',
    regionName: 'Bangkok Metropolitan',
    countryName: 'Thailand',
    city: 'Bangkok',
    phonePrefix: '+66 8',
    currencySymbol: '฿',
    shops: [
      { name: 'Siam Burmese Street Food & Sweets', bio: 'Direct from Mandalay and Yangon: artisanal tea leaf salads, slow-simmered Mohinga broth, and Myanmar faluda.', cuisineType: 'Authentic Burmese Street Classics', locationArea: 'Pratunam Market District', address: 'Phetchaburi Soi 19, Pratunam', avatarSeed: 'bkk_siam' },
      { name: 'Silom Soi 19 Rangoon Spice Kitchen', bio: 'Office crowd favorite serving authentic Ohn No Khao Swè, mutton biryani, and iced milk tea.', cuisineType: 'Rangoon Comfort Food', locationArea: 'Silom Business Hub', address: 'Silom Road Soi 19', avatarSeed: 'bkk_silom' },
      { name: 'Phra Khanong Little Burma Diner', bio: 'The cultural center of the Myanmar diaspora in Bangkok with fresh tofu noodles and fried samosas.', cuisineType: 'Diaspora Heritage Hub', locationArea: 'Phra Khanong', address: 'Sukhumvit 71 Road', avatarSeed: 'bkk_phrakhanong' },
      { name: 'Bang Rak Riverside Mohinga Bar', bio: 'Chao Phraya riverside stall serving lemongrass catfish soup with crispy chickpea crackers.', cuisineType: 'Riverside Noodle Bar', locationArea: 'Charoen Krung', address: 'Charoen Krung Soi 44', avatarSeed: 'bkk_bangrak' },
      { name: 'Sukhumvit Burmese Curry & Tea', bio: 'Cozy air-conditioned cafe serving layered tea, paratha with yellow peas, and beef curries.', cuisineType: 'Casual Cafe & Curries', locationArea: 'Thonglor / Ekkamai', address: 'Sukhumvit Soi 55', avatarSeed: 'bkk_sukhumvit' },
      { name: 'Pratunam Morning Fish Broth Stall', bio: 'Early morning breakfast stall serving market workers with steaming bowls of Royal Mohinga.', cuisineType: 'Morning Market Stall', locationArea: 'Pratunam Center', address: 'Ratchaprarop Road Soi 4', avatarSeed: 'bkk_pratunam' },
      { name: 'Yaowarat Chinatown Shan Noodle House', bio: 'Northern Shan sticky noodles tossed in chili garlic oil and crushed peanuts in Chinatown.', cuisineType: 'Shan Specialty Noodles', locationArea: 'Yaowarat', address: 'Yaowarat Road Soi 8', avatarSeed: 'bkk_yaowarat' },
      { name: 'Huai Khwang Burmese Night Kitchen', bio: 'Late night diner cooking up sizzling grilled skewers, spicy tea leaf salads, and cold drinks.', cuisineType: 'Late Night Burmese BBQ', locationArea: 'Huai Khwang', address: 'Pracha Rat Bamphen Soi 7', avatarSeed: 'bkk_huaikhwang' },
      { name: 'Victory Monument Shan Khau Swe', bio: 'Fast service bowls of silky Shan rice noodles with pickled greens and crispy garlic.', cuisineType: 'Express Shan Noodles', locationArea: 'Victory Monument', address: 'Phahonyothin Soi 1', avatarSeed: 'bkk_vicmon' },
      { name: 'Chatuchak Weekend Tea Leaf Corner', bio: 'Weekend bazaar stall offering freshly packed tea leaf salad kits and iced milk teas.', cuisineType: 'Weekend Market Eats', locationArea: 'Chatuchak Weekend Market', address: 'Section 18, Kamphaeng Phet', avatarSeed: 'bkk_chatuchak' },
      { name: 'Thong Lor Artisanal Burmese Dining', bio: 'Modern upscale Burmese cuisine featuring dry kyay oh, slow-cooked beef cheek, and mocktails.', cuisineType: 'Modern Burmese Bistro', locationArea: 'Thonglor', address: 'Thonglor Soi 10', avatarSeed: 'bkk_thonglor' },
      { name: 'Sathorn Saffron Biryani & Teahouse', bio: 'Authentic Burmese Danbauk biryani served with spicy green chili chutney and sour soup.', cuisineType: 'Danbauk Biryani Specialists', locationArea: 'Sathorn', address: 'Sathorn Tai Soi 11', avatarSeed: 'bkk_sathorn' },
      { name: 'Ari Garden Burmese Noodle House', bio: 'Charming leafy courtyard serving Shan warm tofu, Mandalay mont di, and cold avocado shakes.', cuisineType: 'Garden Noodle Lounge', locationArea: 'Ari Neighborhood', address: 'Phahonyothin 7 Ari Soi 2', avatarSeed: 'bkk_ari' },
      { name: 'Samyan Mitrtown Golden Myanmar Food', bio: 'University hub with fast, delicious bowls of coconut noodles and crispy fried split-pea fritters.', cuisineType: 'University Fast Casual', locationArea: 'Samyan', address: 'Rama IV Road Samyan', avatarSeed: 'bkk_samyan' },
      { name: 'Asok Terminal 21 Burmese Cuisine', bio: 'Food court favorite serving quick halal chicken curries, samosa thoke, and sweet desserts.', cuisineType: 'Urban Food Hall', locationArea: 'Asok Junction', address: 'Sukhumvit 21 Terminal Area', avatarSeed: 'bkk_asok' },
      { name: 'Rama 9 Cyber World Mohinga', bio: 'Hearty breakfast bowls for tech and office workers, spiced with ginger and crispy shallots.', cuisineType: 'Office Hub Breakfast', locationArea: 'Ratchadaphisek', address: 'Ratchada Soi 3', avatarSeed: 'bkk_rama9' },
      { name: 'Bang Na Little Yangon Eatery', bio: 'Suburban haven for authentic family-style dining with rich pork belly stews and bamboo soup.', cuisineType: 'Suburban Family Dining', locationArea: 'Bang Na', address: 'Bangna-Trat Soi 23', avatarSeed: 'bkk_bangna' },
      { name: 'On Nut Burmese Home Cooking', bio: 'Warm neighborhood spot preparing daily specials from Rakhine, Shan, and Bamar regions.', cuisineType: 'Home Style Cooking', locationArea: 'On Nut', address: 'Sukhumvit 77 Soi 14', avatarSeed: 'bkk_onnut' },
      { name: 'Lat Phrao Northern Shan Noodle Shack', bio: 'Generous portions of warm Shan tofu noodles and crispy yellow split-pea fritters.', cuisineType: 'Shan Noodle Shack', locationArea: 'Lat Phrao', address: 'Lat Phrao Soi 101', avatarSeed: 'bkk_latphrao' },
      { name: 'Nonthaburi Chao Phraya Mohinga Pier', bio: 'Riverside morning breeze with steaming bowls of lemongrass catfish soup and boiled eggs.', cuisineType: 'Pier Noodle Stall', locationArea: 'Nonthaburi Pier', address: 'Chao Phraya Pier Walkway', avatarSeed: 'bkk_nonthaburi' },
      { name: 'Rangsit University Burmese Street Eats', bio: 'Student hangout with cheap and hearty Shan noodles, crispy fried chicken, and faluda.', cuisineType: 'Student Street Hub', locationArea: 'Rangsit Campus Area', address: 'Rangsit University Road', avatarSeed: 'bkk_rangsit' },
    ],
  },

  // 7. Chiang Mai (Thailand)
  {
    regionId: 'TH-CNX',
    regionName: 'Chiang Mai',
    countryName: 'Thailand',
    city: 'Chiang Mai',
    phonePrefix: '+66 8',
    currencySymbol: '฿',
    shops: [
      { name: 'Nimman Shan Noodle Lab', bio: 'Trendy Nimman eatery serving organic Shan tofu rice noodles, spicy chili oil, and iced tea.', cuisineType: 'Highland Shan Noodles', locationArea: 'Nimmanhaemin', address: 'Nimman Soi 9', avatarSeed: 'cnx_nimman' },
      { name: 'Old City Tha Phae Burmese Cafe', bio: 'Historic gate cafe offering Royal Mohinga, tea leaf salads, and sweet semolina cakes.', cuisineType: 'Old City Heritage Cafe', locationArea: 'Tha Phae Gate', address: 'Moon Muang Road Soi 3', avatarSeed: 'cnx_thaphae' },
      { name: 'Chang Moi Shan Tofu Kitchen', bio: 'Freshly pressed yellow chickpea tofu served crispy fried, cold tossed, and in warm noodle bowls.', cuisineType: 'Artisanal Tofu Hub', locationArea: 'Chang Moi', address: 'Chang Moi Kao Road', avatarSeed: 'cnx_changmoi' },
      { name: 'Santitham Street Burmese Eats', bio: 'Budget-friendly local favorite with rich coconut noodles and crispy samosa thoke.', cuisineType: 'Street Comfort Food', locationArea: 'Santitham', address: 'Santitham Roundabout', avatarSeed: 'cnx_santitham' },
      { name: 'Riverside Ping Burmese Dining', bio: 'Dining beside Ping River with spiced catfish curries, fresh herb salads, and tamarind cocktails.', cuisineType: 'Riverside Dining', locationArea: 'Ping Riverfront', address: 'Charoenrat Road', avatarSeed: 'cnx_ping' },
      { name: 'Warorot Market Little Burma Stall', bio: 'Inside the historic Kad Luang market serving authentic Shan sweets and fermented tea leaf packs.', cuisineType: 'Market Heritage Stall', locationArea: 'Warorot Market', address: 'Kad Luang Basement Level', avatarSeed: 'cnx_warorot' },
      { name: 'Jed Yod Highland Shan Diner', bio: 'Northern mountain cooking featuring spicy minced chicken meeshay and sour bamboo soup.', cuisineType: 'Highland Shan Diner', locationArea: 'Jed Yod', address: 'Jed Yod Soi 4', avatarSeed: 'cnx_jedyod' },
      { name: 'Suthep Mountain View Tea Lounge', bio: 'Mountain foothills lounge serving roasted green teas, boiled peanuts, and sweet paratha.', cuisineType: 'Foothill Tea Lounge', locationArea: 'Suthep Road', address: 'Suthep Road Soi 15', avatarSeed: 'cnx_suthep' },
      { name: 'Night Bazaar Burmese Spice Corner', bio: 'Lively evening stop serving Danbauk biryani and grilled spiced skewers with mint dip.', cuisineType: 'Night Market Biryani', locationArea: 'Night Bazaar', address: 'Chang Khlan Road', avatarSeed: 'cnx_nightbazaar' },
      { name: 'Hang Dong Shan Herbal Kitchen', bio: 'Farmhouse cooking with garden-grown medicinal herbs, tender braised beef, and sticky rice.', cuisineType: 'Farmhouse Herbal Food', locationArea: 'Hang Dong', address: 'Hang Dong Highway', avatarSeed: 'cnx_hangdong' },
      { name: 'Mae Rim Valley Mohinga Stop', bio: 'Scenic valley stopover for fresh lemongrass fish noodles and sweet coconut pancakes.', cuisineType: 'Valley Traveler Stop', locationArea: 'Mae Rim', address: 'Mae Rim Old Road', avatarSeed: 'cnx_maerim' },
      { name: 'San Sai Organics & Shan Food', bio: 'Organic farm dining with fresh yellow tofu salads and spicy roasted tomato dips.', cuisineType: 'Organic Farm Dining', locationArea: 'San Sai', address: 'San Sai Loop Road', avatarSeed: 'cnx_sansai' },
      { name: 'Hai Ya Traditional Noodle Barn', bio: 'Rustic wooden barn preparing large bowls of Shan noodles with tender braised pork riblets.', cuisineType: 'Rustic Noodle Barn', locationArea: 'Hai Ya', address: 'Thipanet Road', avatarSeed: 'cnx_haiya' },
      { name: 'Chang Phueak North Gate Mohinga', bio: 'Legendary night food spot serving hot catfish Mohinga until 2:00 AM every night.', cuisineType: 'Night Food Landmark', locationArea: 'North Gate', address: 'Manee Nopparat Road', avatarSeed: 'cnx_changphueak' },
      { name: 'Chiang Mai Gate Early Morning Market', bio: 'Dawn breakfast hub for warm sticky rice with yellow peas and fresh milk tea.', cuisineType: 'Dawn Market Breakfast', locationArea: 'South Gate', address: 'Bumrung Buri Road', avatarSeed: 'cnx_cmgate' },
      { name: 'Lang Mor University Shan Hub', bio: 'Behind Chiang Mai University campus serving quick noodles, spicy salads, and iced faluda.', cuisineType: 'Campus Food Hub', locationArea: 'Suthep Campus Back', address: 'Lang Mor Road Soi 6', avatarSeed: 'cnx_langmor' },
      { name: 'Fa Ham Riverbend Burmese Bistro', bio: 'Chill riverside eatery with traditional Burmese salads and spiced river prawn stews.', cuisineType: 'Riverbend Bistro', locationArea: 'Fa Ham', address: 'Fa Ham Pier Road', avatarSeed: 'cnx_faham' },
      { name: 'Wat Ket Heritage Teahouse', bio: 'Historical district teahouse with Mon and Burmese breakfast pastries and spiced chai.', cuisineType: 'Historical Teahouse', locationArea: 'Wat Ket', address: 'Wat Ket Karam Road', avatarSeed: 'cnx_watket' },
      { name: 'Pa Daet Southern Shan Kitchen', bio: 'Authentic home cooking featuring pork belly curry with pickled bamboo and wild mushrooms.', cuisineType: 'Home Style Cooking', locationArea: 'Pa Daet', address: 'Pa Daet Soi 8', avatarSeed: 'cnx_padaet' },
      { name: 'Nong Hoi Market Street Eats', bio: 'Bustling daily market stall with crispy yellow pea fritters and steaming coconut soup.', cuisineType: 'Market Street Eats', locationArea: 'Nong Hoi', address: 'Chiang Mai-Lamphun Road', avatarSeed: 'cnx_nonghoi' },
      { name: 'Khao Kho View Burmese Diner', bio: 'High elevation terrace dining with warm noodle soups and sweet mountain tea.', cuisineType: 'High Elevation Terrace', locationArea: 'Doi Saket Approach', address: 'Mountain View Highway', avatarSeed: 'cnx_khaokho' },
    ],
  },

  // 8. Mae Sot Border (Thailand)
  {
    regionId: 'TH-MSOT',
    regionName: 'Mae Sot Border',
    countryName: 'Thailand',
    city: 'Mae Sot',
    phonePrefix: '+66 8',
    currencySymbol: '฿',
    shops: [
      { name: 'Friendship Bridge Mohinga House', bio: 'Borderland landmark preparing rich Irrawaddy catfish soup, crispy fritters, and hot milk tea.', cuisineType: 'Borderland Landmark Mohinga', locationArea: 'Thai-Myanmar Bridge Gate', address: 'Asia Highway 1, Mae Sot', avatarSeed: 'msot_bridge' },
      { name: 'Mae Sot Central Market Pe-Kyaw', bio: 'Morning market stall famed for mountains of freshly fried golden split-pea fritters.', cuisineType: 'Market Fritter Master', locationArea: 'Central Market', address: 'Intarakiri Road Soi 5', avatarSeed: 'msot_market' },
      { name: 'Moei Riverview Shan Kitchen', bio: 'Overlooking the Moei river border with warm Shan tofu, rice salads, and spicy grilled fish.', cuisineType: 'Riverview Shan Food', locationArea: 'Moei Riverfront', address: 'Moei River Road', avatarSeed: 'msot_moei' },
      { name: 'Rim Moei Border Bazaar Stall', bio: 'Bazaar food stop serving hot Danbauk biryani and pickled mango chutney to cross-border traders.', cuisineType: 'Bazaar Trader Biryani', locationArea: 'Rim Moei Market', address: 'Border Gate Approach', avatarSeed: 'msot_rimmoei' },
      { name: 'Asia Highway Noodle Express', bio: 'Fast road stop for transport drivers serving large bowls of coconut noodles and strong sweet tea.', cuisineType: 'Transit Road Stop', locationArea: 'Highway Junction', address: 'AH1 Highway Marker 12', avatarSeed: 'msot_highway' },
      { name: 'Mae Pa Village Home Cooking', bio: 'Traditional Karen and Burmese village cooking with bamboo shoots, river snails, and herbs.', cuisineType: 'Karen & Burmese Village', locationArea: 'Mae Pa', address: 'Mae Pa Village Road', avatarSeed: 'msot_maepa' },
      { name: 'Tha Sai Luat Early Teahouse', bio: '4:00 AM breakfast hub serving market workers with fresh naan bread and yellow pea stew.', cuisineType: 'Early Dawn Teahouse', locationArea: 'Tha Sai Luat', address: 'Sai Luat Road #14', avatarSeed: 'msot_thasai' },
      { name: 'Mae Tao Creek Herbal Diner', bio: 'Nutrient-rich herbal soups, fresh tea leaf salads, and organic brown rice curries.', cuisineType: 'Herbal Wellness Diner', locationArea: 'Mae Tao', address: 'Mae Tao Clinic Road', avatarSeed: 'msot_maetao' },
      { name: 'Prasart Temple Morning Bites', bio: 'Quiet temple square stall offering sweet coconut sticky rice and crunchy samosa soup.', cuisineType: 'Temple Square Eats', locationArea: 'Downtown Mae Sot', address: 'Prasart Vihara Road', avatarSeed: 'msot_prasart' },
      { name: 'Bazaar Night BBQ & Meeshay', bio: 'Evening skewers seasoned with Shan mountain spices and claypot rice noodles in rich sauce.', cuisineType: 'Evening BBQ & Meeshay', locationArea: 'Night Bazaar', address: 'Bazaar Walking Street', avatarSeed: 'msot_night' },
      { name: 'Mae Kasa Hot Springs Noodle Shack', bio: 'Post-hot spring breakfast with steaming chicken noodles, boiled eggs, and ginger tea.', cuisineType: 'Hot Spring Breakfast', locationArea: 'Mae Kasa', address: 'Hot Spring Road', avatarSeed: 'msot_maekasa' },
      { name: 'Border Gate Tea Leaf Specialists', bio: 'Direct wholesale and retail authentic pickled tea leaves with garlic chips and double-fried beans.', cuisineType: 'Tea Leaf Depot', locationArea: 'Border Gate 2', address: 'Border Trade Depot', avatarSeed: 'msot_teadepot' },
      { name: 'Mae Sot Mosque Halal Curry House', bio: 'Certified halal tender beef curries, saffron biryani, and crispy paratha with lentil soup.', cuisineType: 'Halal Burmese Kitchen', locationArea: 'Mosque Quarter', address: 'Islam Vihara Lane', avatarSeed: 'msot_mosque' },
      { name: 'Khun Phawo Mountain Rest Stop', bio: 'High pass stopover serving hot noodle soups and sweet milk tea in cool mountain air.', cuisineType: 'Mountain Pass Diner', locationArea: 'National Park Gate', address: 'Tak-Mae Sot Mountain Road', avatarSeed: 'msot_phawo' },
      { name: 'Mahawan Farmstead Diner', bio: 'Organic farm vegetables, fresh river fish curries, and sour bamboo shoot soup.', cuisineType: 'Farmstead Delta Food', locationArea: 'Mahawan', address: 'Mahawan Village Central', avatarSeed: 'msot_mahawan' },
      { name: 'Phop Phra Highland Avocado & Tea', bio: 'Fresh Phop Phra avocado shakes, warm Shan tofu bowls, and roasted mountain teas.', cuisineType: 'Highland Avocado & Tea', locationArea: 'Phop Phra Border', address: 'Phop Phra Highway', avatarSeed: 'msot_phopphra' },
      { name: 'Wang Chao River Fish Shack', bio: 'Freshwater fish cooked with lemongrass and tamarind, served with steamed jasmine rice.', cuisineType: 'River Fish Shack', locationArea: 'Riverbank Row', address: 'Chao River Path', avatarSeed: 'msot_wangchao' },
      { name: 'Mae Ramat Northern Shan Kitchen', bio: 'Traditional northern Shan pork stews, sticky rice cakes, and fermented bean dip.', cuisineType: 'Northern Shan Cooking', locationArea: 'Mae Ramat', address: 'Main Street #8', avatarSeed: 'msot_maeramat' },
      { name: 'Friendship Pier Fisherman Cafe', bio: 'Morning catfish Mohinga and sweet milk tea overlooking border fishermen boats.', cuisineType: 'Pier View Cafe', locationArea: 'Border Pier', address: 'Pier Approach 2', avatarSeed: 'msot_pier' },
      { name: 'Tak Border Highway Dining', bio: 'Spicy chicken curries, cold noodle salads, and refreshing lime juice for intercity buses.', cuisineType: 'Intercity Highway Hub', locationArea: 'Highway Bypass', address: 'Bypass Road KM 5', avatarSeed: 'msot_highwaybus' },
      { name: 'Golden Triangle Border Heritage', bio: 'Classic Burmese dishes crafted with cross-border heritage ingredients and fiery roasted chili.', cuisineType: 'Cross-Border Heritage', locationArea: 'Downtown Gate', address: 'Old Customs Road', avatarSeed: 'msot_triangle' },
    ],
  },

  // 9. Singapore Central & Islandwide (Singapore)
  {
    regionId: 'SG-ALL',
    regionName: 'Singapore Central & Islandwide',
    countryName: 'Singapore',
    city: 'Singapore',
    phonePrefix: '+65',
    currencySymbol: 'S$',
    shops: [
      { name: 'Peninsula Golden Myanmar Kitchen', bio: 'Iconic Burmese comfort food serving Singapore with fish broth Mohinga, tender braised beef curries, and spicy tea leaf salads.', cuisineType: 'Peninsula Plaza Heritage Cuisine', locationArea: 'City Hall & Peninsula Plaza', address: '111 North Bridge Road, Peninsula Plaza #B1-08', avatarSeed: 'singapore' },
      { name: 'City Hall Heritage Tea Leaf Cafe', bio: 'Level 3 Peninsula Plaza favorite serving organic highland tea leaf salads and layered sweet milk tea.', cuisineType: 'Highland Tea Lounge', locationArea: 'City Hall', address: 'Peninsula Plaza #03-14', avatarSeed: 'sg_cityhall' },
      { name: 'Little India Rangoon Curry Corner', bio: 'Rich spiced mutton curries, Danbauk biryani, and crispy samosas in vibrant Little India.', cuisineType: 'Burmese-Indian Spiced Curries', locationArea: 'Little India', address: '48 Serangoon Road', avatarSeed: 'sg_littleindia' },
      { name: 'Jurong East Burmese Street Delights', bio: 'West-side commuters favorite for fast, delicious bowls of Ohn No Khao Swè and chicken rice.', cuisineType: 'Commuter Street Food', locationArea: 'Jurong East', address: '10 Jurong Gateway Road', avatarSeed: 'sg_jurong' },
      { name: 'Tampines Century Square Myanmar Bites', bio: 'East-side family dining offering Shan warm tofu, Mandalay mont di, and crispy gourd fritters.', cuisineType: 'Casual Family Dining', locationArea: 'Tampines', address: '4 Tampines Central 5', avatarSeed: 'sg_tampines' },
      { name: 'Clementi West Coast Mohinga Stall', bio: 'Authentic early morning catfish noodle soup served with boiled eggs and golden chickpea crackers.', cuisineType: 'Morning Hawker Mohinga', locationArea: 'Clementi', address: 'Block 448 Clementi Ave 3', avatarSeed: 'sg_clementi' },
      { name: 'Bedok North Shan Noodle Hub', bio: 'Silky rice ribbon noodles tossed with roasted chili oil, crushed peanuts, and tender minced chicken.', cuisineType: 'Shan Noodle Specialists', locationArea: 'Bedok Central', address: '208B New Upper Changi Road', avatarSeed: 'sg_bedok' },
      { name: 'Toa Payoh Lorong Grandma’s Curry', bio: 'Homestyle claypot pork belly curry and sour roselle leaf soup cooked with traditional spices.', cuisineType: 'Claypot Home Curries', locationArea: 'Toa Payoh', address: '185 Toa Payoh Central', avatarSeed: 'sg_toapayoh' },
      { name: 'Chinatown Complex Burmese Hawker', bio: 'Hawker stall serving crispy samosa thoke and sweet coconut rice cakes in Chinatown.', cuisineType: 'Hawker Center Classics', locationArea: 'Chinatown', address: '335 Smith Street #02-114', avatarSeed: 'sg_chinatown' },
      { name: 'Bugis Street Market Sweet Milk Tea', bio: 'Refreshing stop for authentic Burmese Cho Saint milk tea and iced grass jelly coolers.', cuisineType: 'Artisanal Teas & Drinks', locationArea: 'Bugis', address: '3 New Bugis Street', avatarSeed: 'sg_bugis' },
      { name: 'Orchard Emerald Myanmar Kitchen', bio: 'Central shopping district haven for authentic Burmese meals, avocado shakes, and desserts.', cuisineType: 'Central Shopping Dining', locationArea: 'Orchard Road', address: '180 Orchard Road #02-04', avatarSeed: 'sg_orchard' },
      { name: 'Geylang Serai Halal Burmese Kitchen', bio: 'Certified halal Burmese beef rendang style curries and yellow pea paratha in Geylang.', cuisineType: 'Certified Halal Burmese', locationArea: 'Geylang Serai', address: '1 Geylang Serai #01-201', avatarSeed: 'sg_geylang' },
      { name: 'Yishun Ring Road Burmese Flavors', bio: 'Hearty northern dishes: claypot meeshay and spicy fermented fish dips with fresh vegetables.', cuisineType: 'Heartland Neighborhood Eats', locationArea: 'Yishun', address: '930 Yishun Ave 2', avatarSeed: 'sg_yishun' },
      { name: 'Woodlands Checkpoint Noodle Express', bio: 'Quick and satisfying bowls of mohinga and Shan noodles for northern commuters.', cuisineType: 'Express Commuter Noodle', locationArea: 'Woodlands', address: '30 Woodlands Avenue 2', avatarSeed: 'sg_woodlands' },
      { name: 'Ang Mo Kio Avenue 6 Shan Food', bio: 'Highland favorites cooked by Shan natives: warm tofu noodle bowls and crunchy rice crackers.', cuisineType: 'Authentic Shan Kitchen', locationArea: 'Ang Mo Kio', address: '53 Ang Mo Kio Ave 3', avatarSeed: 'sg_amk' },
      { name: 'Katong East Coast Burmese Spices', bio: 'Heritage Peranakan-Burmese fusion curries, coconut chicken stews, and ginger salads.', cuisineType: 'Heritage Fusion Curries', locationArea: 'Katong', address: '112 East Coast Road', avatarSeed: 'sg_katong' },
      { name: 'Punggol Waterway Burmese Diner', bio: 'Waterfront terrace dining with fresh prawn curries, tea leaf salads, and cold Myanmar beer.', cuisineType: 'Waterfront Terrace Dining', locationArea: 'Punggol', address: '83 Punggol Central', avatarSeed: 'sg_punggol' },
      { name: 'Bishan Junction 8 Tea House', bio: 'Quiet cafe spot offering hot sweet tea, warm buns with yellow vatana peas, and faluda.', cuisineType: 'Mall Teahouse Cafe', locationArea: 'Bishan', address: '9 Bishan Place #03-08', avatarSeed: 'sg_bishan' },
      { name: 'Novena Velocity Burmese Stews', bio: 'Nutritious herbal soups, slow-braised beef cheek, and organic salad bowls near medical hub.', cuisineType: 'Healthy Herbal Stews', locationArea: 'Novena', address: '238 Thomson Road', avatarSeed: 'sg_novena' },
      { name: 'Tanjong Pagar CBD Quick Mohinga', bio: 'Fast lunch service for financial district workers: authentic catfish noodles and iced teas.', cuisineType: 'CBD Lunch Express', locationArea: 'Tanjong Pagar', address: '100 Tras Street #01-12', avatarSeed: 'sg_tanjongpagar' },
      { name: 'Holland Village Rangoon Bistro', bio: 'Casual dining with Burmese craft cocktails, spicy skewers, and traditional dinner platters.', cuisineType: 'Bistro & Evening Dining', locationArea: 'Holland Village', address: '24 Lorong Mambong', avatarSeed: 'sg_holland' },
    ],
  },

  // 10. Malaysia (Kuala Lumpur & Selangor)
  {
    regionId: 'MY-ALL',
    regionName: 'Kuala Lumpur & Selangor',
    countryName: 'Malaysia',
    city: 'Kuala Lumpur',
    phonePrefix: '+60 1',
    currencySymbol: 'RM',
    shops: [
      { name: 'Pudu Pasar Little Burma Kitchen', bio: 'The beating heart of KL’s Burmese community with authentic catfish Mohinga and fried pea fritters.', cuisineType: 'Pudu Market Heritage', locationArea: 'Pudu Market', address: 'Jalan Pasar Baharu, Pudu', avatarSeed: 'kl_pudu' },
      { name: 'Jalan Alor Mohinga Stall', bio: 'Bustling night market stall serving hot bowls of lemongrass fish soup to food lovers.', cuisineType: 'Night Market Mohinga', locationArea: 'Bukit Bintang', address: 'Jalan Alor, Bukit Bintang', avatarSeed: 'kl_jalanalor' },
      { name: 'Kota Raya Myanmar Food Hub', bio: 'Historic landmark shopping center food stalls serving Danbauk biryani and Shan rice noodles.', cuisineType: 'Community Food Hub', locationArea: 'Chinatown KL', address: 'Jalan Tun Tan Siew Sin', avatarSeed: 'kl_kotaraya' },
      { name: 'Klang Valley Shan Noodles', bio: 'Silky rice ribbon noodles with spicy minced chicken and pickled greens in Selangor.', cuisineType: 'Shan Noodle Specialists', locationArea: 'Klang Valley', address: 'Jalan Meru, Klang', avatarSeed: 'kl_klang' },
      { name: 'Petaling Jaya Burmese Comfort Food', bio: 'Neighborhood cafe serving homestyle chicken curries, tea leaf salads, and sweet faluda.', cuisineType: 'PJ Suburban Comfort', locationArea: 'Petaling Jaya', address: 'SS2/67, Petaling Jaya', avatarSeed: 'kl_pj' },
      { name: 'Brickfields Rangoon Curry House', bio: 'Authentic spiced beef curries and yellow pea naan in the heart of Little India KL.', cuisineType: 'Spiced Curries & Naan', locationArea: 'Brickfields', address: 'Jalan Tun Sambanthan', avatarSeed: 'kl_brickfields' },
      { name: 'Subang Jaya Student Noodle Bar', bio: 'Affordable noodle bowls, crispy samosa thoke, and sweet Burmese milk tea for students.', cuisineType: 'Student Noodle Bar', locationArea: 'Subang Jaya', address: 'SS15/4B, Subang Jaya', avatarSeed: 'kl_subang' },
      { name: 'Cheras Taman Connaught Night Stall', bio: 'Famous Wednesday night market vendor serving crunchy gourd fritters and tea leaf salad.', cuisineType: 'Night Market Street Eats', locationArea: 'Cheras', address: 'Jalan Cerdas, Cheras', avatarSeed: 'kl_cheras' },
      { name: 'Ampang Point Myanmar Kitchen', bio: 'Family dining with fragrant coconut chicken noodles and rich braised mutton curries.', cuisineType: 'Family Dining', locationArea: 'Ampang', address: 'Jalan Mamanda 9, Ampang', avatarSeed: 'kl_ampang' },
      { name: 'Kepong Industrial Burmese Diner', bio: 'Generous portions of pork belly curry and sour bamboo shoot soup for hungry workers.', cuisineType: 'Hearty Worker Diner', locationArea: 'Kepong', address: 'Jalan Kepong Industrial', avatarSeed: 'kl_kepong' },
      { name: 'Sentul Heritage Tea & Noodle Bar', bio: 'Traditional teahouse with slow-brewed black tea, sweet condensed milk, and fresh snacks.', cuisineType: 'Heritage Teahouse', locationArea: 'Sentul', address: 'Jalan Sentul Pasar', avatarSeed: 'kl_sentul' },
      { name: 'Shah Alam Halal Myanmar Eats', bio: 'Strictly halal certified Burmese curries, saffron rice, and fresh avocado shakes.', cuisineType: 'Halal Certified Burmese', locationArea: 'Shah Alam', address: 'Seksyen 7, Shah Alam', avatarSeed: 'kl_shahalam' },
      { name: 'Damansara Uptown Burmese Bistro', bio: 'Modern dining room serving artisanal tea leaf salads and dry kyay oh vermicelli.', cuisineType: 'Modern Casual Bistro', locationArea: 'Damansara', address: 'Jalan SS 21/37, Damansara', avatarSeed: 'kl_damansara' },
      { name: 'Bangsar South Curry Lounge', bio: 'Business district eatery serving quick lunch sets of fish mohinga and fresh fruit coolers.', cuisineType: 'Business Lunch Lounge', locationArea: 'Bangsar South', address: 'Jalan Kerinchi', avatarSeed: 'kl_bangsar' },
      { name: 'Rawang Northern Shan Kitchen', bio: 'Authentic northern Shan warm tofu and crispy rice cakes in suburban Selangor.', cuisineType: 'Northern Shan Food', locationArea: 'Rawang', address: 'Jalan Rawang Perdana', avatarSeed: 'kl_rawang' },
      { name: 'Kajang Satay & Burmese Grills', bio: 'Unique fusion of charcoal grilled skewers with authentic Burmese balachaung and chili dip.', cuisineType: 'Grilled Skewers & Curries', locationArea: 'Kajang', address: 'Jalan Bukit, Kajang', avatarSeed: 'kl_kajang' },
      { name: 'Selayang Wholesale Market Mohinga', bio: 'Dawn breakfast stall for market traders serving piping hot catfish noodles since 3 AM.', cuisineType: 'Dawn Market Noodle', locationArea: 'Selayang', address: 'Pasar Borong Selayang', avatarSeed: 'kl_selayang' },
      { name: 'Puchong Golden Spoon Myanmar', bio: 'Comfortable family eatery with twenty daily curries and free refills of green tea.', cuisineType: 'Family Curry House', locationArea: 'Puchong', address: 'Bandar Puteri, Puchong', avatarSeed: 'kl_puchong' },
      { name: 'Sri Petaling Spiced Noodle Bar', bio: 'Spicy Rakhine Mont Di and sour fish soup bowls with roasted bird’s eye chili.', cuisineType: 'Rakhine Spiced Broths', locationArea: 'Sri Petaling', address: 'Jalan Radin Bagus', avatarSeed: 'kl_sripetaling' },
      { name: 'Mont Kiara Expat Burmese Cafe', bio: 'Clean, elegant dining featuring organic tea leaf salads and mild coconut chicken noodles.', cuisineType: 'Expat Casual Cafe', locationArea: 'Mont Kiara', address: 'Jalan Kiara 2', avatarSeed: 'kl_montkiara' },
      { name: 'Cyberjaya Tech Hub Myanmar Food', bio: 'Fast bowls of Shan noodles, sweet milk tea, and samosa thoke for tech campus workers.', cuisineType: 'Tech Hub Fast Casual', locationArea: 'Cyberjaya', address: 'Persiaran Multimedia', avatarSeed: 'kl_cyberjaya' },
    ],
  },

  // 11. Japan (Tokyo & Kanto / Takadanobaba)
  {
    regionId: 'JP-ALL',
    regionName: 'Tokyo & Kanto (Takadanobaba)',
    countryName: 'Japan',
    city: 'Tokyo',
    phonePrefix: '+81 3',
    currencySymbol: '¥',
    shops: [
      { name: 'Takadanobaba Little Yangon Diner', bio: 'The capital of Myanmar dining in Tokyo: steaming catfish Mohinga and crispy split-pea fritters.', cuisineType: 'Tokyo Little Yangon Classic', locationArea: 'Takadanobaba, Shinjuku', address: 'Takadanobaba 2-chome 14-8', avatarSeed: 'jp_takadano' },
      { name: 'Shinjuku Golden Pagoda Dining', bio: 'Hearty Burmese chicken curries, Danbauk biryani, and authentic sweet milk tea in Shinjuku.', cuisineType: 'Shinjuku Curry House', locationArea: 'Shinjuku', address: 'Kabukicho 1-chome 8-3', avatarSeed: 'jp_shinjuku' },
      { name: 'Ikebukuro Shan Kitchen', bio: 'Authentic Shan warm tofu noodles, fermented tea leaf salads, and mountain herbal soups.', cuisineType: 'Shan Noodle Specialists', locationArea: 'Ikebukuro', address: 'Higashi-Ikebukuro 1-chome 22', avatarSeed: 'jp_ikebukuro' },
      { name: 'Shibuya Burmese Tea Room', bio: 'Youthful cafe serving layered condensed milk tea, sweet semolina cake, and samosa thoke.', cuisineType: 'Modern Tea Room', locationArea: 'Shibuya', address: 'Udagawacho 12-4', avatarSeed: 'jp_shibuya' },
      { name: 'Ueno Parkside Mohinga Bar', bio: 'Warm bowls of lemongrass catfish soup served with boiled eggs and chickpea crackers.', cuisineType: 'Parkside Noodle Bar', locationArea: 'Ueno', address: 'Ueno 4-chome 10-2', avatarSeed: 'jp_ueno' },
      { name: 'Ginza Royal Mandalay Cuisine', bio: 'Upscale dining featuring slow-braised beef cheek curry and royal Mandalay noodle sets.', cuisineType: 'Upscale Royal Burmese', locationArea: 'Ginza', address: 'Ginza 6-chome 9-1', avatarSeed: 'jp_ginza' },
      { name: 'Roppongi Spiced Myanmar Bistro', bio: 'International lounge with Burmese craft beers, spicy skewers, and tea leaf salads.', cuisineType: 'Bistro & Lounge', locationArea: 'Roppongi', address: 'Roppongi 3-chome 11-4', avatarSeed: 'jp_roppongi' },
      { name: 'Akihabara Quick Noodle Stall', bio: 'Fast and flavor-packed bowls of Ohn No Khao Swè and chicken rice for shoppers.', cuisineType: 'Fast Casual Noodles', locationArea: 'Akihabara', address: 'Sotokanda 1-chome 16', avatarSeed: 'jp_akiba' },
      { name: 'Shin-Okubo Asian Spice Market Cafe', bio: 'Located inside the multicultural spice bazaar serving authentic Burmese snacks.', cuisineType: 'Multicultural Market Cafe', locationArea: 'Shin-Okubo', address: 'Hyakunincho 2-chome 4', avatarSeed: 'jp_shinokubo' },
      { name: 'Nakano Broadway Burmese Bites', bio: 'Subculture haven serving crispy samosas, fried gourd fritters, and sweet faluda.', cuisineType: 'Broadway Street Snacks', locationArea: 'Nakano', address: 'Nakano 5-chome 52-15', avatarSeed: 'jp_nakano' },
      { name: 'Kichijoji Inokashira Tea Garden', bio: 'Peaceful garden cafe serving roasted Shan green tea and coconut sticky rice.', cuisineType: 'Parkside Tea Garden', locationArea: 'Kichijoji', address: 'Gotenyama 1-chome 1-8', avatarSeed: 'jp_kichijoji' },
      { name: 'Yokohama Chinatown Burmese Corner', bio: 'Cross-cultural noodles combining Chinese wontons with aromatic Burmese fish broth.', cuisineType: 'Chinatown Fusion Noodle', locationArea: 'Yokohama', address: 'Yamashitacho, Naka-ku', avatarSeed: 'jp_yokohama' },
      { name: 'Kawasaki Industrial Myanmar Kitchen', bio: 'Generous portions of pork belly curry and sour bamboo shoot soup for workers.', cuisineType: 'Hearty Home Curries', locationArea: 'Kawasaki', address: 'Kawasaki-ku Ekimae 2', avatarSeed: 'jp_kawasaki' },
      { name: 'Chiba Station Burmese Diner', bio: 'Suburban commuters favorite for hot noodle bowls and packaged tea leaf salad kits.', cuisineType: 'Station Commuter Diner', locationArea: 'Chiba', address: 'Fujimi 2-chome 1-1', avatarSeed: 'jp_chiba' },
      { name: 'Saitama Omiya Shan Noodle Hub', bio: 'Silky rice noodles tossed in roasted chili oil and crushed peanuts in Saitama.', cuisineType: 'Shan Noodle Hub', locationArea: 'Omiya', address: 'Daimoncho 1-chome 32', avatarSeed: 'jp_omiya' },
      { name: 'Asakusa Sensoji Mohinga Stall', bio: 'Tourist-friendly stall near the historic temple serving aromatic Burmese noodle soups.', cuisineType: 'Temple Heritage Stall', locationArea: 'Asakusa', address: 'Asakusa 2-chome 3-1', avatarSeed: 'jp_asakusa' },
      { name: 'Meguro Riverside Tea Lounge', bio: 'Cherry blossom viewing cafe with fresh avocado milkshakes and Burmese paratha.', cuisineType: 'Riverside Tea Lounge', locationArea: 'Meguro', address: 'Kamimeguro 1-chome 23', avatarSeed: 'jp_meguro' },
      { name: 'Ebisu Modern Myanmar Dining', bio: 'Contemporary dining featuring wine pairings with braised beef curry and tea leaf salads.', cuisineType: 'Contemporary Wine & Dine', locationArea: 'Ebisu', address: 'Ebisu Minami 1-chome 4', avatarSeed: 'jp_ebisu' },
      { name: 'Otemachi Financial Lunch Express', bio: 'Healthy organic tea leaf salad bowls and coconut chicken noodles for office workers.', cuisineType: 'CBD Healthy Lunch', locationArea: 'Otemachi', address: 'Otemachi 1-chome 6-1', avatarSeed: 'jp_otemachi' },
      { name: 'Shinagawa Portside Mohinga', bio: 'Train transit stop serving quick, steaming bowls of fish broth noodles from 7 AM.', cuisineType: 'Transit Station Kitchen', locationArea: 'Shinagawa', address: 'Konan 2-chome 16', avatarSeed: 'jp_shinagawa' },
      { name: 'Kanda Books & Burmese Tea', bio: 'Historic book town cafe offering quiet reading tables, sweet tea, and warm pastries.', cuisineType: 'Book Town Cafe', locationArea: 'Kanda-Jinbocho', address: 'Jinbocho 1-chome 10', avatarSeed: 'jp_kanda' },
    ],
  },

  // 12. United States (California / Bay Area & NY)
  {
    regionId: 'US-ALL',
    regionName: 'California / Bay Area & NY',
    countryName: 'United States',
    city: 'San Francisco',
    phonePrefix: '+1',
    currencySymbol: '$',
    shops: [
      { name: 'San Francisco Richmond Burmese Teahouse', bio: 'Clement Street landmark serving legendary Fermented Tea Leaf Salad, Royal Mohinga, and coconut noodles.', cuisineType: 'Bay Area Burmese Landmark', locationArea: 'Richmond District, SF', address: '308 Clement Street, San Francisco, CA', avatarSeed: 'us_clement' },
      { name: 'Oakland Burma Superstar Style Kitchen', bio: 'East Bay dining sensation famous for fiery garlic noodles, sesame chicken, and rainbow salad.', cuisineType: 'East Bay Sensation', locationArea: 'Telegraph Ave, Oakland', address: '4722 Telegraph Ave, Oakland, CA', avatarSeed: 'us_oakland' },
      { name: 'Fremont Little Rangoon Noodle Bar', bio: 'Suburban Silicon Valley haven for authentic catfish mohinga, shan noodles, and faluda.', cuisineType: 'Suburban Noodle Bar', locationArea: 'Fremont', address: '39055 Fremont Blvd, Fremont, CA', avatarSeed: 'us_fremont' },
      { name: 'Elmhurst Queens Myanmar Street Food', bio: 'New York City’s authentic gem serving Danbauk chicken biryani, sour soup, and samosa thoke.', cuisineType: 'NYC Authentic Diaspora', locationArea: 'Queens, NYC', address: '82-14 Broadway, Elmhurst, NY', avatarSeed: 'us_queens' },
      { name: 'San Jose Shan Noodle Lab', bio: 'Silicon Valley tech favorite for quick bowls of warm Shan tofu and spicy minced chicken noodles.', cuisineType: 'Tech Hub Noodle Lab', locationArea: 'San Jose', address: '170 W St John St, San Jose, CA', avatarSeed: 'us_sanjose' },
      { name: 'Brooklyn Rangoon Waterfront Kitchen', bio: 'Modern waterfront dining featuring artisanal tea leaf salads, braised pork belly, and craft cocktails.', cuisineType: 'Brooklyn Modern Burmese', locationArea: 'Williamsburg, Brooklyn', address: '500 Metropolitan Ave, Brooklyn, NY', avatarSeed: 'us_brooklyn' },
      { name: 'Berkeley Campus Mohinga Stop', bio: 'Cal student hangout serving affordable noodle bowls, golden split-pea fritters, and sweet milk tea.', cuisineType: 'University Street Food', locationArea: 'Berkeley', address: '2412 Telegraph Ave, Berkeley, CA', avatarSeed: 'us_berkeley' },
      { name: 'Manhattan Midtown Saffron Biryani', bio: 'Midtown office favorite for quick lunch sets of Burmese saffron biryani and coconut curries.', cuisineType: 'Midtown Lunch Express', locationArea: 'Midtown East, NYC', address: '230 E 44th St, New York, NY', avatarSeed: 'us_manhattan' },
      { name: 'Sunset District Golden Gate Teahouse', bio: 'Cozy foggy Sunset cafe serving hot bowls of Ohn No Khao Swè and freshly baked paratha.', cuisineType: 'Sunset Neighborhood Teahouse', locationArea: 'Sunset District, SF', address: '1820 Irving Street, San Francisco, CA', avatarSeed: 'us_sunset' },
      { name: 'Palo Alto University Ave Burmese Bistro', bio: 'Refined dining with organic farmer’s market ingredients, slow-braised beef, and local wines.', cuisineType: 'Refined Silicon Valley Dining', locationArea: 'Palo Alto', address: '520 University Ave, Palo Alto, CA', avatarSeed: 'us_paloalto' },
      { name: 'Staten Island Little Burma Garden', bio: 'Homestyle cooking prepared by Burmese families with authentic fermented fish dips and greens.', cuisineType: 'Community Garden Home Cooking', locationArea: 'Staten Island, NYC', address: '144 Victory Blvd, Staten Island, NY', avatarSeed: 'us_staten' },
      { name: 'Daly City Foggy Hills Mohinga', bio: 'Comforting hot soup in the foggy hills: Irrawaddy catfish broth, boiled eggs, and crispy crackers.', cuisineType: 'Hillside Comfort Food', locationArea: 'Daly City', address: '6100 Mission St, Daly City, CA', avatarSeed: 'us_dalycity' },
      { name: 'Los Angeles Silver Lake Burmese Cantina', bio: 'Hip SoCal spot serving spicy ginger salads, tamarind fish curries, and avocado coolers.', cuisineType: 'SoCal Vibrant Burmese', locationArea: 'Silver Lake, LA', address: '2800 Sunset Blvd, Los Angeles, CA', avatarSeed: 'us_la' },
      { name: 'Flushing Main Street Asian Bazaar Cafe', bio: 'Authentic Burmese street food inside the bustling Queens Asian transit hub.', cuisineType: 'Bazaar Transit Cafe', locationArea: 'Flushing, NYC', address: '40-10 Main St, Flushing, NY', avatarSeed: 'us_flushing' },
      { name: 'San Mateo Downtown Curries', bio: 'Family-friendly Peninsula restaurant with rich beef curry, chicken biryani, and sweet semolina.', cuisineType: 'Peninsula Family Dining', locationArea: 'San Mateo', address: '124 B Street, San Mateo, CA', avatarSeed: 'us_sanmateo' },
      { name: 'Astoria Queens Spiced Skewers', bio: 'Charcoal grilled skewers seasoned with mountain spices, served with sour tamarind sauce.', cuisineType: 'Balkan & Burmese Skewers', locationArea: 'Astoria, NYC', address: '31-15 Broadway, Astoria, NY', avatarSeed: 'us_astoria' },
      { name: 'Sunnyvale Tech Campus Myanmar Eats', bio: 'Healthy lunch bowls, tea leaf salad kits, and iced green tea for tech workers.', cuisineType: 'Fast Healthy Campus Eats', locationArea: 'Sunnyvale', address: '440 S Murphy Ave, Sunnyvale, CA', avatarSeed: 'us_sunnyvale' },
      { name: 'Mountain View Castro Street Diner', bio: 'Bustling pedestrian street eatery serving Royal Mohinga and crispy chickpea fritters.', cuisineType: 'Pedestrian Street Diner', locationArea: 'Mountain View', address: '220 Castro St, Mountain View, CA', avatarSeed: 'us_mountainview' },
      { name: 'San Rafael North Bay Burmese Kitchen', bio: 'Marin County dining room pairing fresh organic produce with traditional Burmese curries.', cuisineType: 'North Bay Organic Dining', locationArea: 'San Rafael', address: '1302 4th St, San Rafael, CA', avatarSeed: 'us_sanrafael' },
      { name: 'Alhambra San Gabriel Valley Myanmar', bio: 'Authentic Southern California Burmese noodles, crispy samosas, and cold iced milk tea.', cuisineType: 'SGV Asian Food Hub', locationArea: 'Alhambra, CA', address: '1100 W Valley Blvd, Alhambra, CA', avatarSeed: 'us_alhambra' },
      { name: 'Long Island City Skyview Burmese Dining', bio: 'Skyline views with artisanal cocktails, tea leaf salad, and braised pork belly stews.', cuisineType: 'Skyline View Dining', locationArea: 'Long Island City, NY', address: '45-50 Jackson Ave, Long Island City, NY', avatarSeed: 'us_lic' },
    ],
  },

  // 13. United Kingdom (London & UK)
  {
    regionId: 'GB-ALL',
    regionName: 'London & UK',
    countryName: 'United Kingdom',
    city: 'London',
    phonePrefix: '+44 20',
    currencySymbol: '£',
    shops: [
      { name: 'Soho Mandalay Kitchen & Bar', bio: 'Vibrant Soho dining room serving authentic catfish Mohinga, crispy samosa thoke, and Burmese gin cocktails.', cuisineType: 'Central London Modern Burmese', locationArea: 'Soho, West End', address: '34 Dean Street, Soho, London', avatarSeed: 'uk_soho' },
      { name: 'Shoreditch Burmese Street Food', bio: 'East London hip street stall serving fiery Shan noodles, tea leaf salads, and sweet faluda.', cuisineType: 'East London Street Food', locationArea: 'Shoreditch', address: '154 Commercial Street, London', avatarSeed: 'uk_shoreditch' },
      { name: 'Camden Lock Tea Leaf Salad Bar', bio: 'Canalside market stall famous for crunchy fermented tea leaf salads with double-fried beans.', cuisineType: 'Canalside Market Eats', locationArea: 'Camden Market', address: 'Camden Lock Place, London', avatarSeed: 'uk_camden' },
      { name: 'Brixton Spiced Mohinga & Curry', bio: 'South London market diner serving rich slow-simmered fish broth and braised beef cheek.', cuisineType: 'South London Market Diner', locationArea: 'Brixton Village', address: 'Unit 22, Coldharbour Lane, London', avatarSeed: 'uk_brixton' },
      { name: 'Covent Garden Royal Burmese Lounge', bio: 'Pre-theatre dining with traditional Ohn No Khao Swè and chicken saffron biryani.', cuisineType: 'Theatre District Dining', locationArea: 'Covent Garden', address: '18 Russell Street, London', avatarSeed: 'uk_covent' },
      { name: 'Borough Market Spice & Noodle Stall', bio: 'Gourmet market favorite using wild-caught fish broth and organic microgreens.', cuisineType: 'Artisan Market Noodle', locationArea: 'Borough Market', address: '8 Southwark Street, London', avatarSeed: 'uk_borough' },
      { name: 'Kensington Palace Burmese Dining', bio: 'Refined family dining room serving royal curries, duck stews, and delicate semolina cake.', cuisineType: 'Refined West London Dining', locationArea: 'Kensington', address: '122 Kensington High St, London', avatarSeed: 'uk_kensington' },
      { name: 'Islington Angel Teahouse', bio: 'Neighborhood cafe serving layered condensed milk tea, warm buns with yellow peas, and snacks.', cuisineType: 'Neighborhood Teahouse', locationArea: 'Angel, Islington', address: '74 Upper Street, London', avatarSeed: 'uk_islington' },
      { name: 'Greenwich Meridian Myanmar Kitchen', bio: 'Historic maritime borough dining with spiced river prawn curries and pickled mango relish.', cuisineType: 'Maritime Heritage Dining', locationArea: 'Greenwich', address: '25 Greenwich Church St, London', avatarSeed: 'uk_greenwich' },
      { name: 'Canary Wharf Quick Mohinga Express', bio: 'Fast financial lunch service: steaming bowls of fish noodles and iced green tea.', cuisineType: 'Financial Lunch Express', locationArea: 'Canary Wharf', address: 'Cabot Square, London', avatarSeed: 'uk_canary' },
      { name: 'Clapham Junction Comfort Bowls', bio: 'Commuter favorite serving warm Shan tofu, crispy fritters, and rich chicken coconut soup.', cuisineType: 'Commuter Comfort Bowls', locationArea: 'Clapham', address: '45 St John’s Hill, London', avatarSeed: 'uk_clapham' },
      { name: 'Hammersmith Riverside Burmese Diner', bio: 'Thames riverbank eatery offering traditional fish soups and spicy tamarind salads.', cuisineType: 'Thames Riverside Diner', locationArea: 'Hammersmith', address: 'Lower Mall, Hammersmith, London', avatarSeed: 'uk_hammersmith' },
      { name: 'Peckham Rye Asian Food Lab', bio: 'Creative rooftop dining serving modern Burmese street food and craft ciders.', cuisineType: 'Rooftop Street Food', locationArea: 'Peckham', address: 'Rye Lane, Peckham, London', avatarSeed: 'uk_peckham' },
      { name: 'Wimbledon Village Tea & Curries', bio: 'Suburban leafy dining room with authentic Burmese curries and warm hospitality.', cuisineType: 'Suburban Village Dining', locationArea: 'Wimbledon', address: '14 High Street, Wimbledon, London', avatarSeed: 'uk_wimbledon' },
      { name: 'Hackney Central Burmese Kitchen', bio: 'Indie cafe preparing plant-based vegetarian tea leaf salads and crispy tofu fritters.', cuisineType: 'Plant-Forward Burmese', locationArea: 'Hackney', address: '224 Mare Street, London', avatarSeed: 'uk_hackney' },
      { name: 'Manchester Northern Quarter Myanmar', bio: 'Industrial brick dining room serving Danbauk biryani and spiced mutton curries in Manchester.', cuisineType: 'Northern UK Spice Hub', locationArea: 'Northern Quarter, Manchester', address: '38 Oldham St, Manchester', avatarSeed: 'uk_manchester' },
      { name: 'Birmingham Bullring Burmese Bites', bio: 'Midlands shopping destination offering quick noodle bowls and sweet coconut desserts.', cuisineType: 'Midlands Street Eats', locationArea: 'Bullring, Birmingham', address: 'Edgbaston St, Birmingham', avatarSeed: 'uk_birmingham' },
      { name: 'Oxford Broad Street Academic Teas', bio: 'Scholarly cafe serving strong Burmese tea, samosa thoke, and ginger salad.', cuisineType: 'University Town Cafe', locationArea: 'Oxford Central', address: '42 Broad Street, Oxford', avatarSeed: 'uk_oxford' },
      { name: 'Cambridge Riverside Mohinga Shack', bio: 'Punting visitors favorite for hot noodle soup, fried yellow peas, and sweet faluda.', cuisineType: 'Riverside Student Shack', locationArea: 'Cambridge Central', address: 'Mill Lane, Cambridge', avatarSeed: 'uk_cambridge' },
      { name: 'Edinburgh Old Town Golden Pagoda', bio: 'Scottish capital dining room warming travelers with rich coconut chicken noodle soup.', cuisineType: 'Highland Warm Bowls', locationArea: 'Old Town, Edinburgh', address: '88 Royal Mile, Edinburgh', avatarSeed: 'uk_edinburgh' },
      { name: 'Bristol Harbourside Burmese Skewers', bio: 'Harbor market food stall serving spicy charcoal grilled meats and tea leaf salads.', cuisineType: 'Harbourside Grill', locationArea: 'Harbourside, Bristol', address: 'Canons Way, Bristol', avatarSeed: 'uk_bristol' },
    ],
  },

  // 14. South Korea (Seoul & Incheon / Bupyeong)
  {
    regionId: 'KR-ALL',
    regionName: 'Seoul & Incheon (Bupyeong)',
    countryName: 'South Korea',
    city: 'Seoul',
    phonePrefix: '+82 2',
    currencySymbol: '₩',
    shops: [
      { name: 'Bupyeong Little Burma Diner', bio: 'The epicenter of Myanmar culture in Korea: authentic Mohinga, Shan noodles, and tea leaf salads.', cuisineType: 'Korean Diaspora Hub', locationArea: 'Bupyeong, Incheon', address: 'Bupyeong-daero 42, Incheon', avatarSeed: 'kr_bupyeong' },
      { name: 'Itaewon Golden Myanmar Kitchen', bio: 'International district favorite serving halal beef curries, Danbauk biryani, and paratha.', cuisineType: 'Itaewon Halal Curries', locationArea: 'Itaewon, Seoul', address: 'Itaewon-ro 27-gil, Seoul', avatarSeed: 'kr_itaewon' },
      { name: 'Hongdae Shan Noodle Bar', bio: 'Trendy youth hub serving silky Shan noodles with chili oil, crispy wontons, and sweet drinks.', cuisineType: 'Youth Cultural Noodle Bar', locationArea: 'Hongdae, Seoul', address: 'Wausan-ro 21-gil, Seoul', avatarSeed: 'kr_hongdae' },
      { name: 'Dongdaemun Market Teahouse', bio: 'Late night market stall serving hot bowls of Ohn No Khao Swè to fashion traders.', cuisineType: 'Late Night Market Soup', locationArea: 'Dongdaemun, Seoul', address: 'Jong-ro 266, Seoul', avatarSeed: 'kr_dongdaemun' },
      { name: 'Gangnam Royal Mandalay Dining', bio: 'Upscale dining room pairing delicate Burmese curries with fine wines and fresh salads.', cuisineType: 'Gangnam Upscale Burmese', locationArea: 'Gangnam, Seoul', address: 'Teheran-ro 152, Seoul', avatarSeed: 'kr_gangnam' },
      { name: 'Myeongdong Street Mohinga Stall', bio: 'Shopping street favorite serving quick bowls of catfish soup and crispy pea fritters.', cuisineType: 'Shopping Street Bites', locationArea: 'Myeongdong, Seoul', address: 'Myeongdong 8-gil, Seoul', avatarSeed: 'kr_myeongdong' },
      { name: 'Sinchon University Burmese Hub', bio: 'Affordable bowls of noodles, samosa thoke, and iced tea for Yonsei and Ewha students.', cuisineType: 'University District Diner', locationArea: 'Sinchon, Seoul', address: 'Yonsei-ro 5-gil, Seoul', avatarSeed: 'kr_sinchon' },
      { name: 'Yeouido Financial District Lunch', bio: 'Healthy tea leaf salads and coconut chicken noodles for investment bankers.', cuisineType: 'Financial District Lunch', locationArea: 'Yeouido, Seoul', address: 'Gukjegeumyung-ro 10, Seoul', avatarSeed: 'kr_yeouido' },
      { name: 'Incheon Chinatown Little Rangoon', bio: 'Cross-cultural noodles and spicy salads located near Incheon harbor.', cuisineType: 'Harbor Chinatown Fusion', locationArea: 'Chinatown, Incheon', address: 'Chinatown-ro 52, Incheon', avatarSeed: 'kr_incheonchina' },
      { name: 'Ansan Multi-Cultural Street Cafe', bio: 'Heart of Ansan multicultural food street serving authentic home-cooked Burmese stews.', cuisineType: 'Multicultural Food Street', locationArea: 'Ansan, Gyeonggi', address: 'Damunhwa-gil 33, Ansan', avatarSeed: 'kr_ansan' },
      { name: 'Suwon Fortress Gate Mohinga', bio: 'Historic fortress gate stall serving hot bowls of fish broth and sweet coconut cakes.', cuisineType: 'Heritage Fortress Stall', locationArea: 'Suwon, Gyeonggi', address: 'Jeongjo-ro, Suwon', avatarSeed: 'kr_suwon' },
      { name: 'Jongno Old City Heritage Teahouse', bio: 'Traditional teahouse atmosphere serving layered sweet milk tea and fried bread.', cuisineType: 'Old City Teahouse', locationArea: 'Jongno, Seoul', address: 'Insadong-gil 24, Seoul', avatarSeed: 'kr_jongno' },
      { name: 'Gongdeok Savory Noodle Corner', bio: 'Office neighborhood favorite for rich dry kyay oh vermicelli and spicy chili dip.', cuisineType: 'Savory Noodle Corner', locationArea: 'Mapo, Seoul', address: 'Mapo-daero 122, Seoul', avatarSeed: 'kr_gongdeok' },
      { name: 'Seongsu Creative Burmese Studio', bio: 'Hip converted industrial cafe serving artisanal tea leaf salads and craft coolers.', cuisineType: 'Industrial Creative Studio', locationArea: 'Seongsu, Seoul', address: 'Seongsui-ro 88, Seoul', avatarSeed: 'kr_seongsu' },
      { name: 'Songpa Lotte World Burmese Treats', bio: 'Family dining with sweet faluda, golden chicken curry, and crispy samosas.', cuisineType: 'Family Entertainment Dining', locationArea: 'Songpa, Seoul', address: 'Olympic-ro 300, Seoul', avatarSeed: 'kr_songpa' },
      { name: 'Guro Digital Valley Noodle Stop', bio: 'Quick service lunch noodles and iced tea for IT and software campus workers.', cuisineType: 'Digital Valley Fast Casual', locationArea: 'Guro, Seoul', address: 'Digital-ro 33-gil, Seoul', avatarSeed: 'kr_guro' },
      { name: 'Gwanghwamun Palace Gate Teas', bio: 'Peaceful tea stop near the royal palace serving roasted green tea and rice cakes.', cuisineType: 'Palace Gate Teahouse', locationArea: 'Jongno, Seoul', address: 'Sejong-daero 175, Seoul', avatarSeed: 'kr_gwanghwamun' },
      { name: 'Busan Haeundae Beachside Mohinga', bio: 'Coastal beach dining in Busan serving fresh fish Mohinga and cold beverages.', cuisineType: 'Beachfront Coastal Food', locationArea: 'Haeundae, Busan', address: 'Haeundaehaebyeon-ro, Busan', avatarSeed: 'kr_busan' },
      { name: 'Daegu Dongseongno Asian Kitchen', bio: 'Downtown shopping area restaurant serving spiced curries and Shan noodle bowls.', cuisineType: 'Downtown Shopping Diner', locationArea: 'Dongseongno, Daegu', address: 'Dongseong-ro 3-gil, Daegu', avatarSeed: 'kr_daegu' },
      { name: 'Daejeon Science City Noodle Lab', bio: 'Nutritious herbal soups, chicken coconut noodles, and fresh tea leaf salads.', cuisineType: 'Science City Healthy Bowls', locationArea: 'Yuseong, Daejeon', address: 'Daehak-ro, Daejeon', avatarSeed: 'kr_daejeon' },
      { name: 'Ulsan Coastal Shipbuilders Diner', bio: 'Hearty portions of braised beef curry and steaming soup for industrial workers.', cuisineType: 'Industrial Port Diner', locationArea: 'Dong-gu, Ulsan', address: 'Bangeojin-ro, Ulsan', avatarSeed: 'kr_ulsan' },
    ],
  },

  // 15. Australia (Sydney & Melbourne)
  {
    regionId: 'AU-ALL',
    regionName: 'Sydney & Melbourne',
    countryName: 'Australia',
    city: 'Sydney',
    phonePrefix: '+61 2',
    currencySymbol: 'A$',
    shops: [
      { name: 'Cabramatta Burmese Noodle House', bio: 'Sydney’s premier Asian food hub serving authentic catfish Mohinga, crispy pe-kyaw, and faluda.', cuisineType: 'Cabramatta Asian Heritage', locationArea: 'Cabramatta, Sydney', address: '54 John Street, Cabramatta NSW', avatarSeed: 'au_cabra' },
      { name: 'Melbourne CBD Little Rangoon', bio: 'Laneway dining in central Melbourne featuring rich Ohn No Khao Swè and Shan tofu noodles.', cuisineType: 'Melbourne Laneway Dining', locationArea: 'Melbourne CBD', address: '18 Tattersalls Lane, Melbourne VIC', avatarSeed: 'au_melb_cbd' },
      { name: 'Marrickville Tea Leaf Cafe', bio: 'Inner West community favorite for organic fermented tea leaf salads and flat white coffee.', cuisineType: 'Inner West Creative Cafe', locationArea: 'Marrickville, Sydney', address: '280 Illawarra Rd, Marrickville NSW', avatarSeed: 'au_marrickville' },
      { name: 'Parramatta Spice & Biryani Kitchen', bio: 'Western Sydney hotspot for authentic Danbauk saffron chicken biryani and tender goat curry.', cuisineType: 'Western Sydney Spice Kitchen', locationArea: 'Parramatta, Sydney', address: '124 Church Street, Parramatta NSW', avatarSeed: 'au_parramatta' },
      { name: 'Richmond Victoria Street Burmese Bowls', bio: 'Lively dining along Little Saigon serving spicy Rakhine mont di and crispy fritters.', cuisineType: 'Richmond Vibrant Dining', locationArea: 'Richmond, Melbourne', address: '210 Victoria Street, Richmond VIC', avatarSeed: 'au_richmond' },
      { name: 'Chatswood Interchange Mohinga Bar', bio: 'North Shore commuters favorite for steaming bowls of Irrawaddy catfish soup and samosas.', cuisineType: 'Commuter Hub Mohinga', locationArea: 'Chatswood, Sydney', address: '436 Victoria Ave, Chatswood NSW', avatarSeed: 'au_chatswood' },
      { name: 'Fitzroy Bohemian Myanmar Lounge', bio: 'Plant-forward Burmese dishes, vegan tea leaf salads, and natural wines in trendy Fitzroy.', cuisineType: 'Bohemian Plant-Forward', locationArea: 'Fitzroy, Melbourne', address: '145 Brunswick St, Fitzroy VIC', avatarSeed: 'au_fitzroy' },
      { name: 'Newtown King Street Street Eats', bio: 'Eclectic King Street diner serving spicy samosa thoke and warm Shan tofu noodle bowls.', cuisineType: 'Eclectic Urban Street Food', locationArea: 'Newtown, Sydney', address: '320 King Street, Newtown NSW', avatarSeed: 'au_newtown' },
      { name: 'Footscray Market Myanmar Kitchen', bio: 'Multicultural market stall serving generous bowls of coconut chicken soup and beef curries.', cuisineType: 'Market Heritage Food', locationArea: 'Footscray, Melbourne', address: '81 Hopkins St, Footscray VIC', avatarSeed: 'au_footscray' },
      { name: 'Haymarket Chinatown Burmese Flavors', bio: 'Chinatown eatery offering slow-simmered duck curry and crispy yellow pea crackers.', cuisineType: 'Chinatown Comfort Food', locationArea: 'Haymarket, Sydney', address: '68 Dixon Street, Haymarket NSW', avatarSeed: 'au_haymarket' },
      { name: 'St Kilda Beachside Burmese Cafe', bio: 'Sunny seaside cafe serving refreshing avocado shakes, tea leaf salads, and chicken skewers.', cuisineType: 'Seaside Casual Dining', locationArea: 'St Kilda, Melbourne', address: '50 Acland Street, St Kilda VIC', avatarSeed: 'au_stkilda' },
      { name: 'Surry Hills Modern Burmese Dining', bio: 'Design-led dining room pairing slow-braised beef cheek with Australian craft wines.', cuisineType: 'Design-Led Modern Dining', locationArea: 'Surry Hills, Sydney', address: '485 Crown Street, Surry Hills NSW', avatarSeed: 'au_surryhills' },
      { name: 'Carlton Lygon Street Fusion Bistro', bio: 'Unique blend of handmade pasta traditions with Burmese coconut turmeric broth.', cuisineType: 'Cultural Fusion Bistro', locationArea: 'Carlton, Melbourne', address: '180 Lygon Street, Carlton VIC', avatarSeed: 'au_carlton' },
      { name: 'Bondi Junction Coastal Tea Room', bio: 'Healthy organic tea leaf salad bowls and iced green tea for beachgoers.', cuisineType: 'Coastal Healthy Bowls', locationArea: 'Bondi Junction, Sydney', address: '500 Oxford St, Bondi Junction NSW', avatarSeed: 'au_bondi' },
      { name: 'Box Hill Asian Hub Myanmar Noodle', bio: 'Fast bowls of Shan rice ribbon noodles and deep-fried gourd fritters in Box Hill.', cuisineType: 'Asian Hub Fast Casual', locationArea: 'Box Hill, Melbourne', address: '1 Main Street, Box Hill VIC', avatarSeed: 'au_boxhill' },
      { name: 'Strathfield Station Burmese Express', bio: 'Quick noodle bowls and crispy samosas for busy Western Sydney railway commuters.', cuisineType: 'Railway Express Dining', locationArea: 'Strathfield, Sydney', address: 'Rawson St, Strathfield NSW', avatarSeed: 'au_strathfield' },
      { name: 'South Yarra Chapel Street Lounge', bio: 'Chic lounge serving Myanmar craft beers, spicy skewers, and sweet semolina desserts.', cuisineType: 'Chic Dining Lounge', locationArea: 'South Yarra, Melbourne', address: '220 Chapel St, South Yarra VIC', avatarSeed: 'au_southyarra' },
      { name: 'Manly Ferry Wharf Mohinga Shack', bio: 'Scenic ferry terminal stall serving hot fish noodle soup to coastal walkers.', cuisineType: 'Ferry Terminal Shack', locationArea: 'Manly, Sydney', address: 'Manly Wharf, Manly NSW', avatarSeed: 'au_manly' },
      { name: 'Brunswick Sydney Road Spiced Kitchen', bio: 'Vibrant multicultural corridor serving certified halal chicken curries and flatbreads.', cuisineType: 'Multicultural Halal Food', locationArea: 'Brunswick, Melbourne', address: '350 Sydney Rd, Brunswick VIC', avatarSeed: 'au_brunswick' },
      { name: 'Crows Nest Lower North Shore Dining', bio: 'Cozy village restaurant serving authentic family recipes and sweet palm sugar tea.', cuisineType: 'Village Family Restaurant', locationArea: 'Crows Nest, Sydney', address: '88 Willoughby Rd, Crows Nest NSW', avatarSeed: 'au_crowsnest' },
      { name: 'Hawthorn Glenferrie Road Noodle Bar', bio: 'University precinct student favorite with cheap and hearty Shan noodles and iced faluda.', cuisineType: 'University Precinct Diner', locationArea: 'Hawthorn, Melbourne', address: '680 Glenferrie Rd, Hawthorn VIC', avatarSeed: 'au_hawthorn' },
    ],
  },

  // 16. European Union (Major EU Diaspora Hubs: Germany, France, Netherlands, Spain)
  {
    regionId: 'EU-ALL',
    regionName: 'European Union (Berlin, Paris, Amsterdam)',
    countryName: 'European Union',
    city: 'Berlin',
    phonePrefix: '+49 30',
    currencySymbol: '€',
    shops: [
      { name: 'Berlin Mitte Myanmar Kitchen', bio: 'Artisanal Burmese dishes, fresh yellow Shan tofu, and organic tea leaf salads in Berlin Mitte.', cuisineType: 'Continental Diaspora Bistro', locationArea: 'Mitte, Berlin', address: 'Torstraße 88, Berlin, Germany', avatarSeed: 'eu_berlin' },
      { name: 'Paris Belleville Rangoon Delights', bio: 'Cosmopolitan Paris bistro preparing fragrant coconut chicken noodles, samosa thoke, and sweet faluda.', cuisineType: 'Parisian Burmese Bistro', locationArea: 'Belleville, Paris', address: 'Rue de Belleville 45, Paris, France', avatarSeed: 'eu_paris' },
      { name: 'Amsterdam Jordaan Mohinga House', bio: 'Canalside favorite serving warm bowls of lemongrass catfish soup and crispy yellow split-pea fritters.', cuisineType: 'Canalside Comfort Food', locationArea: 'Jordaan, Amsterdam', address: 'Prinsengracht 210, Amsterdam, Netherlands', avatarSeed: 'eu_amsterdam' },
      { name: 'Munich Bavarian Pagoda Dining', bio: 'Bavarian-Burmese friendly dining room pairing slow-braised spiced beef with fresh salads and beers.', cuisineType: 'Alpine Burmese Dining', locationArea: 'Schwabing, Munich', address: 'Leopoldstraße 54, Munich, Germany', avatarSeed: 'eu_munich' },
      { name: 'Frankfurt Financial District Noodle Bar', bio: 'Fast lunch sets of Shan rice noodles, tea leaf salads, and iced green tea for bankers.', cuisineType: 'CBD Healthy Lunch', locationArea: 'Frankfurt Central', address: 'Taunusanlage 8, Frankfurt, Germany', avatarSeed: 'eu_frankfurt' },
      { name: 'Lyon Presqu’île Burmese Flavors', bio: 'Gastronomy capital dining featuring artisanal kyay oh and crispy gourd fritters.', cuisineType: 'Culinary Heritage Dining', locationArea: 'Presqu’île, Lyon', address: 'Rue Mercière 18, Lyon, France', avatarSeed: 'eu_lyon' },
      { name: 'Rotterdam Markthal Myanmar Corner', bio: 'Vibrant modern food hall stall serving spicy Danbauk biryani and cold drinks.', cuisineType: 'Modern Food Hall', locationArea: 'Markthal, Rotterdam', address: 'Verlengde Nieuwstraat, Rotterdam', avatarSeed: 'eu_rotterdam' },
      { name: 'Madrid Malasaña Burmese Cantina', bio: 'Sunny terrace dining with spicy tamarind fish, crunchy peanuts, and fresh mint salads.', cuisineType: 'Mediterranean Burmese Lounge', locationArea: 'Malasaña, Madrid', address: 'Calle de Manuela Malasaña 14, Madrid', avatarSeed: 'eu_madrid' },
      { name: 'Barcelona Eixample Tea Lounge', bio: 'Catalan-Burmese cafe serving fermented tea leaf salad, coconut soup, and avocado shakes.', cuisineType: 'Cosmopolitan Cafe', locationArea: 'Eixample, Barcelona', address: 'Carrer de València 240, Barcelona', avatarSeed: 'eu_barcelona' },
      { name: 'Stockholm Södermalm Organic Shan Food', bio: 'Nordic organic ingredients blended with highland Shan tofu and roasted chili oil.', cuisineType: 'Nordic-Shan Organic', locationArea: 'Södermalm, Stockholm', address: 'Götgatan 78, Stockholm, Sweden', avatarSeed: 'eu_stockholm' },
      { name: 'Brussels EU Quarter Myanmar Cuisine', bio: 'European capital favorite for warm bowls of Ohn No Khao Swè and chicken curry.', cuisineType: 'Diplomatic District Dining', locationArea: 'European Quarter, Brussels', address: 'Rue de la Loi 150, Brussels, Belgium', avatarSeed: 'eu_brussels' },
    ],
  },
];

// Curated Master Dish Pool (50 Authentic Burmese Recipes)
export interface DishSpec {
  title: string;
  description: string;
  category: string;
  basePrice: number;
  isVegetarian: boolean;
  isHalal: boolean;
  preferredType: MenuType;
  availableDays?: string[];
  imageUrl: string;
}

export const MASTER_DISH_POOL: DishSpec[] = [
  // Noodles & Broth
  {
    title: 'Royal Mandalay Catfish Mohinga',
    description: 'Slow-simmered aromatic catfish broth with lemongrass, ginger, tender thin rice vermicelli, and crispy yellow split-pea crackers.',
    category: 'Noodles & Broth',
    basePrice: 5.5,
    isVegetarian: false,
    isHalal: true,
    preferredType: 'SPECIAL',
    imageUrl: '/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg',
  },
  {
    title: 'Creamy Ohn No Khao Swè',
    description: 'Golden chicken and coconut milk noodle soup with boiled egg, red chili flakes, shallots, and crispy wonton crisps.',
    category: 'Noodles & Broth',
    basePrice: 6.5,
    isVegetarian: false,
    isHalal: true,
    preferredType: 'SPECIAL',
    imageUrl: '/src/assets/images/burmeal_ohn_no_khao_swe_1793906770581.jpg',
  },
  {
    title: 'Shan Warm Tofu Rice Noodle (Tofu Nway)',
    description: 'Velvety warm yellow split-pea tofu poured over hand-pulled rice noodles, topped with spicy chili oil and crushed peanuts.',
    category: 'Noodles & Broth',
    basePrice: 5.8,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'WEEKLY',
    availableDays: ['Mon', 'Wed', 'Fri', 'Sun'],
    imageUrl: '/src/assets/images/burmeal_tea_leaf_salad_1793906770254.jpg',
  },
  {
    title: 'Mandalay Nan Gyi Thoke',
    description: 'Thick round rice noodles tossed in roasted chickpea flour, spiced chicken oil, hard-boiled egg, and fresh lime juice.',
    category: 'Noodles & Broth',
    basePrice: 6.8,
    isVegetarian: false,
    isHalal: true,
    preferredType: 'WEEKLY',
    availableDays: ['Tue', 'Thu', 'Sat', 'Sun'],
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Rakhine Spicy Fish Mohinga (Arakan Style)',
    description: 'Sour, fiery and peppery fish broth from the Arakan coast packed with green chili, boiled duck egg, and vermicelli.',
    category: 'Noodles & Broth',
    basePrice: 6.0,
    isVegetarian: false,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg',
  },
  {
    title: 'Taunggyi Garlic Rice Noodles with Minced Chicken',
    description: 'Highland Shan flat noodles tossed with aromatic garlic oil, scallions, and savory minced chicken.',
    category: 'Noodles & Broth',
    basePrice: 6.2,
    isVegetarian: false,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_ohn_no_khao_swe_1793906770581.jpg',
  },
  {
    title: 'Claypot Meeshay with Fermented Bean Paste',
    description: 'Sizzling rice noodles cooked in earthen claypot with savory fermented black soybean sauce and pickled mustard greens.',
    category: 'Noodles & Broth',
    basePrice: 7.2,
    isVegetarian: false,
    isHalal: false,
    preferredType: 'WEEKLY',
    availableDays: ['Mon', 'Thu', 'Sat'],
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Traditional Pork & Egg Kyay Oh Soup',
    description: 'Clear nourishing pork broth with vermicelli, tender minced meatballs, braised quail eggs, and fresh watercress.',
    category: 'Noodles & Broth',
    basePrice: 7.5,
    isVegetarian: false,
    isHalal: false,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg',
  },
  {
    title: 'Dry Kyay Oh Sikhet with Crispy Wontons',
    description: 'Dry tossed vermicelli noodles in sesame garlic sauce served with a piping hot bowl of clear broth and wontons on the side.',
    category: 'Noodles & Broth',
    basePrice: 7.8,
    isVegetarian: false,
    isHalal: false,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_ohn_no_khao_swe_1793906770581.jpg',
  },
  {
    title: 'Shan Khao Swè with Roasted Chili Oil',
    description: 'The defining soup of Shan State: rice ribbon noodles in a spiced tomato broth with tender chicken and pickled greens.',
    category: 'Noodles & Broth',
    basePrice: 6.5,
    isVegetarian: false,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Mawlamyine Mont Di in Peppery Fish Broth',
    description: 'Mawlamyine regional fish soup accented with roasted black pepper, fresh lemon basil, and thin rice noodles.',
    category: 'Noodles & Broth',
    basePrice: 5.8,
    isVegetarian: false,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg',
  },
  {
    title: 'Pyay Steamed Rice Noodles with Dried Shrimp',
    description: 'Steamed delicate rice ribbons drizzled with golden shallot oil, toasted crushed sesame, and savory dried shrimp powder.',
    category: 'Noodles & Broth',
    basePrice: 5.2,
    isVegetarian: false,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },

  // Salads & Snacks (Thoke)
  {
    title: 'Traditional Laphet Thoke (Tea Leaf Salad)',
    description: 'National culinary treasure: pickled highland tea leaves tossed with double-fried yellow split-peas, garlic chips, and roasted sesame.',
    category: 'Salads & Snacks',
    basePrice: 5.0,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_tea_leaf_salad_1793906770254.jpg',
  },
  {
    title: 'Crispy Samosa Thoke with Cabbage & Mint',
    description: 'Crushed golden potato samosas bathed in tangy tamarind lentil broth with shredded cabbage, mint, and sliced shallots.',
    category: 'Salads & Snacks',
    basePrice: 4.8,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_tea_leaf_salad_1793906770254.jpg',
  },
  {
    title: 'Shan Yellow Chickpea Tofu Salad',
    description: 'Silky sliced yellow tofu tossed with roasted peanut oil, tamarind dressing, fresh coriander, and crispy shallots.',
    category: 'Salads & Snacks',
    basePrice: 4.5,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_tea_leaf_salad_1793906770254.jpg',
  },
  {
    title: 'Gin Thoke (Pickled Ginger Salad)',
    description: 'Thinly sliced fermented young ginger, roasted peanuts, toasted sesame, fried garlic, and fresh green chili.',
    category: 'Salads & Snacks',
    basePrice: 4.5,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_tea_leaf_salad_1793906770254.jpg',
  },
  {
    title: 'Pennywort Leaf Salad (Myin Kkwa Thoke)',
    description: 'Healing fresh pennywort leaves with roasted chickpea powder, sliced red onions, lime, and crushed peanuts.',
    category: 'Salads & Snacks',
    basePrice: 4.6,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_tea_leaf_salad_1793906770254.jpg',
  },
  {
    title: 'Crispy Split-Pea Fritters (Pe Kyaw)',
    description: 'Piping hot crunchy yellow split-pea crackers served with sweet-and-sour garlic tamarind dipping sauce.',
    category: 'Salads & Snacks',
    basePrice: 3.8,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Golden Fried Gourd Fritters (Bu Thee Kyaw)',
    description: 'Crisp tempura-style fresh gourd batons served golden brown with house crushed-chili tamarind sauce.',
    category: 'Salads & Snacks',
    basePrice: 3.8,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'WEEKLY',
    availableDays: ['Mon', 'Wed', 'Fri', 'Sat', 'Sun'],
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Shan Rice Cakes with Roasted Crushed Sesame',
    description: 'Steamed glutinous rice pressed cakes lightly grilled and sprinkled with mountain salt and toasted sesame seeds.',
    category: 'Salads & Snacks',
    basePrice: 3.5,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Crispy Pork Riblets with Mountain Garlic',
    description: 'Tender marinated pork riblet bites deep-fried with whole Shan mountain garlic cloves and sweet basil.',
    category: 'Salads & Snacks',
    basePrice: 6.5,
    isVegetarian: false,
    isHalal: false,
    preferredType: 'WEEKLY',
    availableDays: ['Fri', 'Sat', 'Sun'],
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Banana Flower Salad with Toasted Peanuts',
    description: 'Shredded banana blossom tossed with lime, shallot oil, toasted chickpea flour, and crushed dried shrimp.',
    category: 'Salads & Snacks',
    basePrice: 4.8,
    isVegetarian: false,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_tea_leaf_salad_1793906770254.jpg',
  },

  // Rice & Main Dishes (Curries & Stews)
  {
    title: 'Slow-Braised Burmese Beef Curry',
    description: 'Aromatic tender chuck roast stewed in roasted Burmese masala, ginger, garlic, shallots, and rich golden oil.',
    category: 'Rice & Main Dishes',
    basePrice: 9.5,
    isVegetarian: false,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Golden Chicken & Potato Curry',
    description: 'Homestyle Burmese curry with chicken on the bone and tender potato chunks simmered in turmeric lemongrass oil.',
    category: 'Rice & Main Dishes',
    basePrice: 8.5,
    isVegetarian: false,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Fragrant Prawn Curry in Sweet Tomato Gravy',
    description: 'Fresh succulent river prawns simmered in sweet ripe tomato reduction with shallots, garlic, and fresh cilantro.',
    category: 'Rice & Main Dishes',
    basePrice: 10.5,
    isVegetarian: false,
    isHalal: true,
    preferredType: 'WEEKLY',
    availableDays: ['Wed', 'Thu', 'Sat', 'Sun'],
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Aromatic Mutton Curry with Green Cardamom',
    description: 'Melt-in-your-mouth slow-braised mutton cubes infused with whole cloves, green cardamom, and caramelized onions.',
    category: 'Rice & Main Dishes',
    basePrice: 11.5,
    isVegetarian: false,
    isHalal: true,
    preferredType: 'WEEKLY',
    availableDays: ['Fri', 'Sat', 'Sun'],
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Danbauk (Burmese Saffron Chicken Biryani)',
    description: 'Fragrant saffron and cardamom spiced basmati rice baked with tender chicken, raisins, cashews, and pickled mango.',
    category: 'Rice & Main Dishes',
    basePrice: 9.8,
    isVegetarian: false,
    isHalal: true,
    preferredType: 'SPECIAL',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Tamarind Fish Curry with Crispy Garlic',
    description: 'Tender river fish steaks simmered in a golden tangy tamarind reduction with crisp whole garlic cloves.',
    category: 'Rice & Main Dishes',
    basePrice: 9.2,
    isVegetarian: false,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Braised Pork Belly & Pickled Bamboo Shoot',
    description: 'Classic comfort stew: tender pork belly cubes cooked with tangy fermented bamboo shoots in fragrant spiced sauce.',
    category: 'Rice & Main Dishes',
    basePrice: 8.8,
    isVegetarian: false,
    isHalal: false,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Ngapi Yay Dip with Crisp Garden Vegetables',
    description: 'Spicy fermented fish dip accompanied by a lavish assortment of crisp garden cucumbers, wing beans, and herbs.',
    category: 'Rice & Main Dishes',
    basePrice: 6.0,
    isVegetarian: false,
    isHalal: false,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Shan Sticky Rice with Steamed Fish & Crisp Shallots',
    description: 'Traditional Shan mountain sticky rice flavored with turmeric and shallot oil, served with seasoned steamed fish.',
    category: 'Rice & Main Dishes',
    basePrice: 7.8,
    isVegetarian: false,
    isHalal: true,
    preferredType: 'WEEKLY',
    availableDays: ['Tue', 'Thu', 'Sat'],
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Roasted Duck Curry in Burmese Spiced Red Gravy',
    description: 'Roasted succulent duck leg stewed in aromatic spiced tomato red gravy with fresh lemongrass and shallots.',
    category: 'Rice & Main Dishes',
    basePrice: 11.0,
    isVegetarian: false,
    isHalal: true,
    preferredType: 'SPECIAL',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Golden Egg & Tomato Curry with Cilantro',
    description: 'Hard-boiled eggs deep-fried until blistered and golden, simmered in a savory sweet tomato curry.',
    category: 'Rice & Main Dishes',
    basePrice: 6.5,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Bitter Gourd Stir-Fry with Dried Shrimp',
    description: 'Thinly sliced bitter gourd wok-tossed with dried shrimp flakes, sliced shallots, garlic, and turmeric.',
    category: 'Rice & Main Dishes',
    basePrice: 5.5,
    isVegetarian: false,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },

  // Breakfast Specials
  {
    title: 'Steamed Sticky Rice with Boiled Vatana Peas',
    description: 'Traditional morning breakfast: tender white glutinous rice topped with salted boiled yellow peas and fried shallots.',
    category: 'Breakfast Specials',
    basePrice: 3.8,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Freshly Baked Burmese Naan with Yellow Peas',
    description: 'Tandoor-baked fluffy naan bread served piping hot with seasoned yellow vatana pea puree and sesame oil.',
    category: 'Breakfast Specials',
    basePrice: 4.0,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Mont Lin Ma Yar ("Husband & Wife" Rice Cakes)',
    description: 'Crispy hemispherical rice batter cakes cooked in cast-iron dimpled molds, fused together with quail eggs and scallions.',
    category: 'Breakfast Specials',
    basePrice: 3.5,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Mont Pyit Thalet (Fluffy Savory Rice Pancake)',
    description: 'Thick savory fermented rice pancake filled with soft steamed yellow peas, scallions, and toasted sesame.',
    category: 'Breakfast Specials',
    basePrice: 3.2,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Golden Coconut Sticky Rice with Peanuts',
    description: 'Sweet yellow sticky rice cooked with coconut milk, shredded fresh coconut meat, and roasted peanuts.',
    category: 'Breakfast Specials',
    basePrice: 3.6,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Mandalay Sweet Shwe Gyi Semolina Cake',
    description: 'Rich baked semolina coconut cake topped with toasted poppy seeds and golden crust.',
    category: 'Breakfast Specials',
    basePrice: 3.0,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Crisp Deep-Fried Youtiao with Sweet Dip',
    description: 'Pair of golden crispy dough fritters (E Kyaw Kway) served fresh with sweet milk tea dip.',
    category: 'Breakfast Specials',
    basePrice: 2.8,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },

  // Beverages & Desserts
  {
    title: 'Authentic Burmese Sweet Milk Tea (Cho Saint)',
    description: 'The national beverage: strong brewed black tea mixed with sweetened condensed milk and evaporated milk.',
    category: 'Beverages & Desserts',
    basePrice: 2.5,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Strong Condensed Milk Tea (Cho Khar)',
    description: 'Traditional teahouse style: extra-bold black tea brew with balanced sweetness for the serious tea enthusiast.',
    category: 'Beverages & Desserts',
    basePrice: 2.5,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Iced Grass Jelly with Coconut Nectar',
    description: 'Refreshing herbal black grass jelly cubes served over shaved ice with pure coconut milk and palm nectar.',
    category: 'Beverages & Desserts',
    basePrice: 3.5,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Fresh Sugar Cane Juice with Calamansi',
    description: 'Cold-pressed fresh sugar cane stalk juice with a zesty squeeze of calamansi citrus over crushed ice.',
    category: 'Beverages & Desserts',
    basePrice: 3.2,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Shwe Yin Aye Coconut Milk Dessert',
    description: 'Iconic chilled coconut cream bowl loaded with pandan jelly noodles, sago pearls, sweet sticky rice, and white bread.',
    category: 'Beverages & Desserts',
    basePrice: 4.5,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'SPECIAL',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Shan Mountain Roasted Green Tea Pot',
    description: 'Free-flow pot of smoky pan-roasted whole-leaf green tea from the misty heights of Taunggyi.',
    category: 'Beverages & Desserts',
    basePrice: 2.0,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Royal Avocado Milkshake with Honey',
    description: 'Thick, creamy blend of fresh Shan avocados, whole milk, and wild forest blossom honey.',
    category: 'Beverages & Desserts',
    basePrice: 4.8,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Iced Tamarind Cooler with Jaggery',
    description: 'Tangy-sweet chilled tamarind infusion sweetened with natural palm sugar jaggery and fresh mint.',
    category: 'Beverages & Desserts',
    basePrice: 3.0,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'PERMANENT',
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
  {
    title: 'Burmese Faluda with Rose Syrup & Pudding',
    description: 'Decadent multi-layered dessert drink with sweet rose syrup, basil seeds, egg custard pudding, and vanilla ice cream.',
    category: 'Beverages & Desserts',
    basePrice: 5.2,
    isVegetarian: true,
    isHalal: true,
    preferredType: 'WEEKLY',
    availableDays: ['Fri', 'Sat', 'Sun'],
    imageUrl: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
  },
];

/**
 * Procedurally generates all shops: >20 shops in EACH of the 15 regions!
 * Total = 15 regions * 21+ shops = 315+ shops
 */
export function generateAllMockShops(): Shop[] {
  const allShops: Shop[] = [];
  const now = new Date().toISOString();

  REGION_SPECS.forEach((spec, rIdx) => {
    // Halve shops per region (~11 shops per region across all 15 regions = 165 shops)
    spec.shops.slice(0, 11).forEach((s, sIdx) => {
      let shopId = `shop_r${rIdx + 1}_${sIdx + 1}`;
      let ownerId = `usr_owner_r${rIdx + 1}_${sIdx + 1}`;
      let ownerEmail = `owner_${spec.regionId.toLowerCase()}_${sIdx + 1}@burmeal.com`;

      // Backward-compatible IDs for anchor demo accounts
      if (spec.regionId === 'MM-MDY' && sIdx === 0) {
        shopId = 'shop_01';
        ownerId = 'usr_owner_01';
        ownerEmail = 'mandalay@burmeal.com';
      } else if (spec.regionId === 'MM-YGN' && sIdx === 0) {
        shopId = 'shop_02';
        ownerId = 'usr_owner_02';
        ownerEmail = 'rangoon@burmeal.com';
      } else if (spec.regionId === 'MM-SHN' && sIdx === 0) {
        shopId = 'shop_03';
        ownerId = 'usr_owner_03';
        ownerEmail = 'shan@burmeal.com';
      } else if (spec.regionId === 'TH-BKK' && sIdx === 0) {
        shopId = 'shop_04';
        ownerId = 'usr_owner_04';
        ownerEmail = 'bangkok@burmeal.com';
      } else if (spec.regionId === 'SG-ALL' && sIdx === 0) {
        shopId = 'shop_05';
        ownerId = 'usr_owner_05';
        ownerEmail = 'singapore@burmeal.com';
      }

      const cleanPhone = `${spec.phonePrefix.replace(/\s+/g, '')}${1000000 + (rIdx * 100 + sIdx)}`;
      const formattedPhone = `${spec.phonePrefix} ${200 + rIdx} ${1000 + sIdx}`;

      allShops.push({
        id: shopId,
        ownerId,
        ownerEmail,
        name: s.name,
        bio: s.bio,
        coverImage: s.coverUrl || '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
        avatarImage: `https://api.dicebear.com/7.x/identicon/svg?seed=${s.avatarSeed}`,
        status: sIdx === 0 && rIdx === 2 ? 'PENDING' : 'APPROVED', // 1 pending for testing admin
        cuisineType: s.cuisineType,
        locationArea: s.locationArea,
        address: s.address,
        city: spec.city,
        region: spec.regionName,
        country: spec.countryName,
        facebookUrl: `https://facebook.com/${s.avatarSeed}`,
        whatsappPhone: cleanPhone.replace(/[^0-9]/g, ''),
        viberPhone: cleanPhone.replace(/[^0-9]/g, ''),
        lineId: `@${s.avatarSeed}`,
        phoneNumber: formattedPhone,
        isOpen: true,
        operatingHours: '7:00 AM - 8:30 PM',
        createdAt: now,
        followerCount: 15 + ((rIdx * 7 + sIdx * 3) % 45),
        itemCount: 11,
        isFollowed: false,
      });
    });
  });

  return allShops;
}

/**
 * Procedurally generates 11 menu items for EACH shop (halved from ~22).
 * Across 165 shops = 1,815 items.
 * Distribution: 1 Special, 3 Weekly, 7 Permanent.
 */
export function generateAllMockMenuItems(shops: Shop[]): MenuItem[] {
  const allItems: MenuItem[] = [];
  const now = new Date().toISOString();
  const todayStr = new Date().toISOString().slice(0, 10);
  const totalPool = MASTER_DISH_POOL.length; // 50 items

  shops.forEach((shop, sIdx) => {
    // 11 items per shop
    const shopItemsCount = 11;

    for (let i = 0; i < shopItemsCount; i++) {
      const dishIdx = (sIdx * 3 + i) % totalPool;
      const baseDish = MASTER_DISH_POOL[dishIdx];
      const itemId = `item_${shop.id}_${i + 1}`;

      // Distribute menu types: 1 Special, 3 Weekly, 7 Permanent
      let mType: MenuType = 'PERMANENT';
      let specialDate: string | undefined = undefined;
      let availableDays: string[] | undefined = undefined;

      if (i === 0) {
        mType = 'SPECIAL';
        specialDate = todayStr;
      } else if (i >= 1 && i <= 3) {
        mType = 'WEEKLY';
        const daySets = [
          ['Mon', 'Wed', 'Fri'],
          ['Tue', 'Thu', 'Sat'],
          ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          ['Sat', 'Sun'],
          ['Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        ];
        availableDays = daySets[(sIdx + i) % daySets.length];
      }

      allItems.push({
        id: itemId,
        shopId: shop.id,
        shopName: shop.name,
        title: baseDish.title,
        description: baseDish.description,
        image: baseDish.imageUrl,
        price: baseDish.basePrice,
        category: baseDish.category,
        menuType: mType,
        isVegetarian: baseDish.isVegetarian,
        isHalal: baseDish.isHalal,
        specialDate,
        availableDays,
        createdAt: now,
        isSaved: false,
        contactLinks: {
          whatsappPhone: shop.whatsappPhone,
          viberPhone: shop.viberPhone,
          lineId: shop.lineId,
          facebookUrl: shop.facebookUrl,
          phoneNumber: shop.phoneNumber,
        },
      });
    }
  });

  return allItems;
}

/**
 * Generates User accounts for all shop owners so any shop owner can log in or be tested
 */
export function generateMockOwners(shops: Shop[]): User[] {
  const now = new Date().toISOString();
  return shops.map((s) => ({
    id: s.ownerId,
    email: s.ownerEmail || `${s.id}@burmeal.com`,
    name: `${s.name} Host`,
    role: 'SHOP_OWNER',
    avatarUrl: s.avatarImage,
    createdAt: now,
  }));
}
