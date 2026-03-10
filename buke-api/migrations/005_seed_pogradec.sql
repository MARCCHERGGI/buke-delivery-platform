CREATE SCHEMA IF NOT EXISTS buke;
SET search_path = buke, public;

INSERT INTO buke.users (
  id,
  email,
  phone_e164,
  full_name,
  is_active,
  default_address_text,
  default_latitude,
  default_longitude
)
VALUES
  (
    '30000000-0000-4000-8000-000000000001',
    'test.customer@buke.local',
    '+355690000001',
    'Test Customer',
    true,
    'Hotel Enkelana, Pogradec',
    40.900300,
    20.666600
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    'test.driver@buke.local',
    '+355690000002',
    'Test Driver',
    true,
    'City Center, Pogradec',
    40.902470,
    20.656960
  )
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  phone_e164 = EXCLUDED.phone_e164,
  full_name = EXCLUDED.full_name,
  is_active = EXCLUDED.is_active,
  default_address_text = EXCLUDED.default_address_text,
  default_latitude = EXCLUDED.default_latitude,
  default_longitude = EXCLUDED.default_longitude;

INSERT INTO buke.drivers (
  id,
  user_id,
  phone_e164,
  vehicle_type,
  status,
  is_active,
  current_latitude,
  current_longitude,
  last_seen_at
)
VALUES (
  '40000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000002',
  '+355690000002',
  'scooter',
  'available',
  true,
  40.902470,
  20.656960,
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  phone_e164 = EXCLUDED.phone_e164,
  vehicle_type = EXCLUDED.vehicle_type,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active,
  current_latitude = EXCLUDED.current_latitude,
  current_longitude = EXCLUDED.current_longitude,
  last_seen_at = EXCLUDED.last_seen_at;

INSERT INTO buke.restaurants (
  id,
  name,
  slug,
  cuisine_type,
  address_text,
  latitude,
  longitude,
  delivery_radius_m,
  prep_time_minutes,
  is_open,
  is_active
)
VALUES
  ('10000000-0000-4000-8000-000000000001','Casa Di Pizza','casa-di-pizza','Italian / Pizza','Rruga Reshit Collaku, Pogradec',40.902470,20.656960,3000,20,true,true),
  ('10000000-0000-4000-8000-000000000002','La Casa Pizzeria','la-casa-pizzeria','Italian / Pizza','Rruga Reshit Collaku, Pogradec',40.901900,20.657500,2800,22,true,true),
  ('10000000-0000-4000-8000-000000000003','Pizza Kupa','pizza-kupa','Pizza / Fast Food','Rruga Deshmoret e Pojskes, Pogradec',40.902700,20.655800,3000,18,true,true),
  ('10000000-0000-4000-8000-000000000004','Artist Pizza','artist-pizza','Pizza / Italian','Bulevardi Europa, Pogradec',40.901800,20.658500,2700,20,true,true),
  ('10000000-0000-4000-8000-000000000005','Swissburger House','swissburger-house','Burgers / Fast Food','Rruga Gani Homcani, Pogradec',40.903100,20.655900,2500,15,true,true),
  ('10000000-0000-4000-8000-000000000006','Fast Food Rusi Grill','fast-food-rusi-grill','Grill / Fast Food','Rruga Gani Homcani, Pogradec',40.903400,20.654900,3000,14,true,true),
  ('10000000-0000-4000-8000-000000000007','Stop and Go Food','stop-and-go-food','Fast Food / Street Food','Rruga Fan Noli, Pogradec',40.902000,20.655400,3000,12,true,true),
  ('10000000-0000-4000-8000-000000000008','Restorant Tradita','restorant-tradita','Traditional Albanian','Rruga Vilson Blloshmi, Pogradec',40.901300,20.660800,2600,24,true,true),
  ('10000000-0000-4000-8000-000000000009','Restaurant Pogradeci','restaurant-pogradeci','Seafood / Albanian','Lake Promenade, Pogradec',40.900900,20.666000,2400,26,true,true),
  ('10000000-0000-4000-8000-000000000010','Restorant Zgara Familjare','restorant-zgara-familjare','Grill / Traditional','Rruga Deshmoret e Pojskes, Pogradec',40.904000,20.653900,2500,21,true,true),
  ('10000000-0000-4000-8000-000000000011','Bizantin Restaurant','bizantin-restaurant','Mediterranean / Seafood','Lake Promenade, Pogradec',40.900700,20.667100,2400,27,true,true),
  ('10000000-0000-4000-8000-000000000012','Restorant Cavos','restorant-cavos','Mediterranean / European','Lake Promenade, Pogradec',40.900600,20.667700,2300,26,true,true),
  ('10000000-0000-4000-8000-000000000013','Taverna Ndona','taverna-ndona','Taverna / Albanian / Greek','Rruga Fan S Noli, Pogradec',40.901500,20.661700,2300,23,true,true),
  ('10000000-0000-4000-8000-000000000014','Oborri Familjar','oborri-familjar','Family Style / Traditional Grill','Rruga Sul Starovari, Pogradec',40.904500,20.651900,2000,20,true,true),
  ('10000000-0000-4000-8000-000000000015','Restaurant Rosa e Tymosur - Villa Borana','restaurant-rosa-e-tymosur-villa-borana','Smokehouse / European','Bulevardi Europa, Pogradec',40.900800,20.664700,2200,21,true,true),
  ('10000000-0000-4000-8000-000000000016','THE CHANGE Bar-Restaurant','the-change-bar-restaurant','Modern European / Fusion','Lake Promenade, Pogradec',40.900400,20.668400,2400,22,true,true),
  ('10000000-0000-4000-8000-000000000017','Toka Hotel Restaurant','toka-hotel-restaurant','Albanian / Mediterranean','Bulevardi Europa, Pogradec',40.900900,20.665500,2000,24,true,true),
  ('10000000-0000-4000-8000-000000000018','Camping Arbi Bar-Restaurant','camping-arbi-bar-restaurant','Camping Grill / Casual Albanian','Rruga e Drilonit, Pogradec',40.899700,20.670800,2000,18,true,true),
  ('10000000-0000-4000-8000-000000000019','Restorant Varka Lin','restorant-varka-lin','Lake Fish / Traditional Albanian','Lin, Pogradec',40.868000,20.708800,2000,28,true,true)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  cuisine_type = EXCLUDED.cuisine_type,
  address_text = EXCLUDED.address_text,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  delivery_radius_m = EXCLUDED.delivery_radius_m,
  prep_time_minutes = EXCLUDED.prep_time_minutes,
  is_open = EXCLUDED.is_open,
  is_active = EXCLUDED.is_active;

INSERT INTO buke.menu_items (
  id,
  restaurant_id,
  name,
  description,
  category,
  price_amount_all,
  currency_code,
  is_available,
  sort_order
)
VALUES
  ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Pizza Margherita','Tomato sauce, mozzarella, basil.','Pizza',750,'ALL',true,1),
  ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','Pizza Prosciutto e Funghi','Ham, mushrooms, mozzarella.','Pizza',920,'ALL',true,2),
  ('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','Tiramisu','Classic mascarpone dessert.','Dessert',450,'ALL',true,3),
  ('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000002','Pizza 4 Stinet','Ham, mushrooms, olives, peppers.','Pizza',1050,'ALL',true,1),
  ('20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000002','Spaghetti Carbonara','Egg yolk cream, pancetta, parmesan.','Pasta',720,'ALL',true,2),
  ('20000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000002','Tiramisu','House tiramisu.','Dessert',450,'ALL',true,3),
  ('20000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000003','Pizza Kupa Mix','Mixed meats and vegetables.','Pizza',1000,'ALL',true,1),
  ('20000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000003','Pide me Mish','Soft baked pide with meat.','Fast Food',520,'ALL',true,2),
  ('20000000-0000-4000-8000-000000000009','10000000-0000-4000-8000-000000000003','Patate te Skuqura','Crispy fries.','Sides',250,'ALL',true,3),
  ('20000000-0000-4000-8000-000000000010','10000000-0000-4000-8000-000000000004','Pizza Artist','Signature house pizza.','Pizza',1050,'ALL',true,1),
  ('20000000-0000-4000-8000-000000000011','10000000-0000-4000-8000-000000000004','Pasta Bolognese','Slow-cooked beef ragu.','Pasta',700,'ALL',true,2),
  ('20000000-0000-4000-8000-000000000012','10000000-0000-4000-8000-000000000004','Bruschetta','Grilled bread, tomato, basil.','Appetizer',350,'ALL',true,3),
  ('20000000-0000-4000-8000-000000000013','10000000-0000-4000-8000-000000000005','Swissburger Classic','Beef patty, cheddar, pickles.','Burger',650,'ALL',true,1),
  ('20000000-0000-4000-8000-000000000014','10000000-0000-4000-8000-000000000005','Swissburger Double','Double beef, cheddar, onions.','Burger',850,'ALL',true,2),
  ('20000000-0000-4000-8000-000000000015','10000000-0000-4000-8000-000000000005','Loaded Fries','Fries with cheddar and crispy onions.','Sides',350,'ALL',true,3),
  ('20000000-0000-4000-8000-000000000016','10000000-0000-4000-8000-000000000006','Sufllaqe Pule','Chicken wrap with fries.','Wrap',450,'ALL',true,1),
  ('20000000-0000-4000-8000-000000000017','10000000-0000-4000-8000-000000000006','Qofte me Patate','Homestyle meatballs with potatoes.','Grill',550,'ALL',true,2),
  ('20000000-0000-4000-8000-000000000018','10000000-0000-4000-8000-000000000006','Suxhuk ne Zgare','Grilled suxhuk sausage.','Grill',550,'ALL',true,3),
  ('20000000-0000-4000-8000-000000000019','10000000-0000-4000-8000-000000000007','Burger Stop&Go','Fast beef burger.','Burger',550,'ALL',true,1),
  ('20000000-0000-4000-8000-000000000020','10000000-0000-4000-8000-000000000007','Tortilla me Pule','Chicken tortilla wrap.','Wrap',500,'ALL',true,2),
  ('20000000-0000-4000-8000-000000000021','10000000-0000-4000-8000-000000000007','Crepe Nutella','Sweet crepe with Nutella.','Dessert',350,'ALL',true,3),
  ('20000000-0000-4000-8000-000000000022','10000000-0000-4000-8000-000000000008','Tave Kosi','Baked lamb and yogurt casserole.','Traditional',850,'ALL',true,1),
  ('20000000-0000-4000-8000-000000000023','10000000-0000-4000-8000-000000000008','Fergese Tirane','Peppers, tomatoes, cottage cheese.','Traditional',700,'ALL',true,2),
  ('20000000-0000-4000-8000-000000000024','10000000-0000-4000-8000-000000000008','Tave Dheu','Clay pot casserole with beef.','Traditional',850,'ALL',true,3),
  ('20000000-0000-4000-8000-000000000025','10000000-0000-4000-8000-000000000009','Koran ne Zgare','Lake fish grilled over charcoal.','Fish',1500,'ALL',true,1),
  ('20000000-0000-4000-8000-000000000026','10000000-0000-4000-8000-000000000009','Kallamar i Ferguar','Fried calamari.','Seafood',900,'ALL',true,2),
  ('20000000-0000-4000-8000-000000000027','10000000-0000-4000-8000-000000000009','Sallate Shopska','Tomato, cucumber, cheese salad.','Salad',450,'ALL',true,3),
  ('20000000-0000-4000-8000-000000000028','10000000-0000-4000-8000-000000000010','Mix Grill Familjare','Mixed grill platter.','Grill',1600,'ALL',true,1),
  ('20000000-0000-4000-8000-000000000029','10000000-0000-4000-8000-000000000010','Qebapa','Grilled kebabs.','Grill',650,'ALL',true,2),
  ('20000000-0000-4000-8000-000000000030','10000000-0000-4000-8000-000000000010','Sallate Fshati','Village salad.','Salad',400,'ALL',true,3),
  ('20000000-0000-4000-8000-000000000031','10000000-0000-4000-8000-000000000011','Koran Bizantin','Signature lake fish.','Fish',1650,'ALL',true,1),
  ('20000000-0000-4000-8000-000000000032','10000000-0000-4000-8000-000000000011','Risotto me Karkaleca','Shrimp risotto.','Seafood',1250,'ALL',true,2),
  ('20000000-0000-4000-8000-000000000033','10000000-0000-4000-8000-000000000011','Panna Cotta','Italian custard dessert.','Dessert',450,'ALL',true,3),
  ('20000000-0000-4000-8000-000000000034','10000000-0000-4000-8000-000000000012','Oktapod ne Zgare','Grilled octopus.','Seafood',1700,'ALL',true,1),
  ('20000000-0000-4000-8000-000000000035','10000000-0000-4000-8000-000000000012','Beef Tagliata','Sliced beef tagliata.','Main',1550,'ALL',true,2),
  ('20000000-0000-4000-8000-000000000036','10000000-0000-4000-8000-000000000012','Chocolate Souffle','Warm chocolate dessert.','Dessert',500,'ALL',true,3),
  ('20000000-0000-4000-8000-000000000037','10000000-0000-4000-8000-000000000013','Berxolla Qengji','Lamb chops from the grill.','Grill',1450,'ALL',true,1),
  ('20000000-0000-4000-8000-000000000038','10000000-0000-4000-8000-000000000013','Musaka','Baked musaka.','Traditional',850,'ALL',true,2),
  ('20000000-0000-4000-8000-000000000039','10000000-0000-4000-8000-000000000013','Djathe i Pjekur','Baked cheese starter.','Appetizer',450,'ALL',true,3),
  ('20000000-0000-4000-8000-000000000040','10000000-0000-4000-8000-000000000014','Pule Fshati Gjysme','Half village chicken.','Grill',850,'ALL',true,1),
  ('20000000-0000-4000-8000-000000000041','10000000-0000-4000-8000-000000000014','Mix Grill per 2','Mixed grill for two.','Grill',2200,'ALL',true,2),
  ('20000000-0000-4000-8000-000000000042','10000000-0000-4000-8000-000000000014','Petulla me Mjalte','Fried dough with honey.','Dessert',300,'ALL',true,3),
  ('20000000-0000-4000-8000-000000000043','10000000-0000-4000-8000-000000000015','Trofte e Tymosur','Smoked trout.','Fish',1450,'ALL',true,1),
  ('20000000-0000-4000-8000-000000000044','10000000-0000-4000-8000-000000000015','Brinje Derri BBQ','BBQ pork ribs.','Grill',1500,'ALL',true,2),
  ('20000000-0000-4000-8000-000000000045','10000000-0000-4000-8000-000000000015','Burger Villa Borana','House burger.','Burger',750,'ALL',true,3),
  ('20000000-0000-4000-8000-000000000046','10000000-0000-4000-8000-000000000016','Tomahawk Steak','Large tomahawk steak.','Main',4200,'ALL',true,1),
  ('20000000-0000-4000-8000-000000000047','10000000-0000-4000-8000-000000000016','Sushi Roll Combo','Mixed sushi rolls.','Fusion',1300,'ALL',true,2),
  ('20000000-0000-4000-8000-000000000048','10000000-0000-4000-8000-000000000016','Cheesecake','Baked cheesecake.','Dessert',500,'ALL',true,3),
  ('20000000-0000-4000-8000-000000000049','10000000-0000-4000-8000-000000000017','Koran Toka','House lake fish.','Fish',1550,'ALL',true,1),
  ('20000000-0000-4000-8000-000000000050','10000000-0000-4000-8000-000000000017','Mish Qengji Slow Cook','Slow cooked lamb.','Main',1700,'ALL',true,2),
  ('20000000-0000-4000-8000-000000000051','10000000-0000-4000-8000-000000000017','Creme Caramel','Classic caramel custard.','Dessert',350,'ALL',true,3),
  ('20000000-0000-4000-8000-000000000052','10000000-0000-4000-8000-000000000018','Trofte ne Zgare','Grilled trout.','Fish',1300,'ALL',true,1),
  ('20000000-0000-4000-8000-000000000053','10000000-0000-4000-8000-000000000018','Camping Burger','Casual burger.','Burger',650,'ALL',true,2),
  ('20000000-0000-4000-8000-000000000054','10000000-0000-4000-8000-000000000018','Byrek me Djathe','Cheese pie.','Bakery',250,'ALL',true,3),
  ('20000000-0000-4000-8000-000000000055','10000000-0000-4000-8000-000000000019','Koran e Linit','Lin style lake fish.','Fish',1650,'ALL',true,1),
  ('20000000-0000-4000-8000-000000000056','10000000-0000-4000-8000-000000000019','Tave Korani','Baked koran casserole.','Fish',1600,'ALL',true,2),
  ('20000000-0000-4000-8000-000000000057','10000000-0000-4000-8000-000000000019','Kek me Arra','Walnut cake.','Dessert',400,'ALL',true,3)
ON CONFLICT (id) DO UPDATE
SET
  restaurant_id = EXCLUDED.restaurant_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_amount_all = EXCLUDED.price_amount_all,
  currency_code = EXCLUDED.currency_code,
  is_available = EXCLUDED.is_available,
  sort_order = EXCLUDED.sort_order;
