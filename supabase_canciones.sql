-- Ejecutar en el SQL Editor de Supabase Dashboard
-- Inserta un álbum por artista y 5 canciones por álbum

-- ── Álbumes ──────────────────────────────────────────────────────────────
insert into albums (id_album, titulo, año, canciones, id_artista_fk) values
  ('a1000001-0000-0000-0000-000000000001', 'Cosmic Bells', '2022-03-15', 5, 'b897e61d-e273-4e46-bea9-e77d4c8e0478'),  -- TomNook
  ('a1000001-0000-0000-0000-000000000002', 'Village Sessions', '2021-07-20', 5, 'ebcba97c-8aa9-44dd-b2ad-fe2f692ace8f'),  -- Totakeke
  ('a1000001-0000-0000-0000-000000000003', 'Happy Island', '2023-01-10', 5, '91cf8002-71a3-4db6-aff2-d62860e3833b'),  -- Canela
  ('a1000001-0000-0000-0000-000000000004', 'Jazz Nocturno', '2020-11-05', 5, '03b0bae3-7b3c-44c2-98ff-d1263bcb6c7e'),  -- Fígaro
  ('a1000001-0000-0000-0000-000000000005', 'Forest Songs', '2022-09-01', 5, '11fadea9-e14c-4536-9310-ed30ae258b91'),  -- Fauno
  ('a1000001-0000-0000-0000-000000000006', 'Brisa Tropical', '2023-05-18', 5, '1740f0fe-c06f-4428-ac20-4550d8657332'),  -- Camilo
  ('a1000001-0000-0000-0000-000000000007', 'Lluvia de Notas', '2021-12-01', 5, '5998b9eb-1cb0-4e5f-bd63-3ff565100079'); -- Lluvia

-- ── Canciones de TomNook ─────────────────────────────────────────────────
insert into canciones (titulo, duracion, num_reproducciones, id_album_fk) values
  ('Bells of the Universe', 214, 182000, 'a1000001-0000-0000-0000-000000000001'),
  ('Nook Inc. Theme',       187, 143000, 'a1000001-0000-0000-0000-000000000001'),
  ('Real Estate Orbit',     243, 97000,  'a1000001-0000-0000-0000-000000000001'),
  ('Morning Mortgage',      198, 211000, 'a1000001-0000-0000-0000-000000000001'),
  ('Island Dreams',         261, 158000, 'a1000001-0000-0000-0000-000000000001');

-- ── Canciones de Totakeke ────────────────────────────────────────────────
insert into canciones (titulo, duracion, num_reproducciones, id_album_fk) values
  ('K.K. Aria',       178, 324000, 'a1000001-0000-0000-0000-000000000002'),
  ('Stale Cupcakes',  203, 198000, 'a1000001-0000-0000-0000-000000000002'),
  ('My Place',        191, 267000, 'a1000001-0000-0000-0000-000000000002'),
  ('Mr. K.K.',        217, 412000, 'a1000001-0000-0000-0000-000000000002'),
  ('K.K. Folk',       224, 189000, 'a1000001-0000-0000-0000-000000000002');

-- ── Canciones de Canela ──────────────────────────────────────────────────
insert into canciones (titulo, duracion, num_reproducciones, id_album_fk) values
  ('Sweet Morning',    183, 301000, 'a1000001-0000-0000-0000-000000000003'),
  ('Island Giggle',    196, 245000, 'a1000001-0000-0000-0000-000000000003'),
  ('Sunny Gossip',     211, 178000, 'a1000001-0000-0000-0000-000000000003'),
  ('Bubblegum Hours',  174, 334000, 'a1000001-0000-0000-0000-000000000003'),
  ('Happy Landing',    229, 289000, 'a1000001-0000-0000-0000-000000000003');

-- ── Canciones de Fígaro ──────────────────────────────────────────────────
insert into canciones (titulo, duracion, num_reproducciones, id_album_fk) values
  ('Midnight Espresso',  257, 143000, 'a1000001-0000-0000-0000-000000000004'),
  ('The Last Haircut',   234, 119000, 'a1000001-0000-0000-0000-000000000004'),
  ('Melancholy Trim',    248, 98000,  'a1000001-0000-0000-0000-000000000004'),
  ('Rainy Appointment',  219, 167000, 'a1000001-0000-0000-0000-000000000004'),
  ('Scissors and Stars', 271, 132000, 'a1000001-0000-0000-0000-000000000004');

-- ── Canciones de Fauno ───────────────────────────────────────────────────
insert into canciones (titulo, duracion, num_reproducciones, id_album_fk) values
  ('Dawn Walk',      192, 221000, 'a1000001-0000-0000-0000-000000000005'),
  ('Mushroom Path',  207, 187000, 'a1000001-0000-0000-0000-000000000005'),
  ('Forest Hum',     183, 243000, 'a1000001-0000-0000-0000-000000000005'),
  ('Acorn Season',   218, 156000, 'a1000001-0000-0000-0000-000000000005'),
  ('Willow Lullaby', 241, 198000, 'a1000001-0000-0000-0000-000000000005');

-- ── Canciones de Camilo ──────────────────────────────────────────────────
insert into canciones (titulo, duracion, num_reproducciones, id_album_fk) values
  ('Guayaba Sunrise', 223, 378000, 'a1000001-0000-0000-0000-000000000006'),
  ('Palmera Dance',   198, 312000, 'a1000001-0000-0000-0000-000000000006'),
  ('Amor Tropical',   245, 445000, 'a1000001-0000-0000-0000-000000000006'),
  ('Brisa del Mar',   211, 289000, 'a1000001-0000-0000-0000-000000000006'),
  ('Tarde de Verano', 234, 367000, 'a1000001-0000-0000-0000-000000000006');

-- ── Canciones de Lluvia ──────────────────────────────────────────────────
insert into canciones (titulo, duracion, num_reproducciones, id_album_fk) values
  ('Lluvia de Abril',   198, 267000, 'a1000001-0000-0000-0000-000000000007'),
  ('Tormenta de Notas', 224, 198000, 'a1000001-0000-0000-0000-000000000007'),
  ('Gotas de Jazz',     187, 312000, 'a1000001-0000-0000-0000-000000000007'),
  ('Nublado Interior',  241, 143000, 'a1000001-0000-0000-0000-000000000007'),
  ('Arco Iris Final',   213, 289000, 'a1000001-0000-0000-0000-000000000007');
