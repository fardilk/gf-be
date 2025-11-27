import { PrismaClient } from '@prisma/client';

export async function seedCities(prisma: PrismaClient) {
  const cities = [
    'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang',
    'Makassar', 'Palembang', 'Tangerang', 'Depok', 'Bekasi',
    'Bogor', 'Batam', 'Pekanbaru', 'Bandar Lampung', 'Padang',
    'Malang', 'Denpasar', 'Samarinda', 'Banjarmasin', 'Tasikmalaya',
    'Pontianak', 'Cimahi', 'Balikpapan', 'Jambi', 'Surakarta',
    'Serang', 'Mataram', 'Manado', 'Yogyakarta', 'Cilegon',
    'Kupang', 'Palu', 'Ambon', 'Sukabumi', 'Cirebon',
    'Pekalongan', 'Kediri', 'Madiun', 'Probolinggo', 'Tegal',
    'Binjai', 'Mojokerto', 'Magelang', 'Batu', 'Pasuruan',
    'Bengkulu', 'Jayapura', 'Ternate', 'Bima', 'Gorontalo',
    'Sorong', 'Bitung', 'Palangkaraya', 'Lubuklinggau', 'Tanjungpinang',
    'Pangkalpinang', 'Sabang', 'Banda Aceh', 'Lhokseumawe', 'Langsa',
    'Dumai', 'Solok', 'Sawahlunto', 'Bukittinggi', 'Payakumbuh',
    'Pariaman', 'Jambi City', 'Sungai Penuh', 'Bengkulu City', 'Metro',
    'Bandar Lampung City', 'Pangkal Pinang City', 'Tanjung Pinang City', 'Batam City', 'Palembang City',
    'Prabumulih', 'Lubuklinggau City', 'Pagar Alam', 'Bengkulu City', 'Bandar Lampung City',
    'Metro City', 'Serang City', 'Cilegon City', 'Tangerang City', 'South Tangerang',
    'Bekasi City', 'Depok City', 'Bogor City', 'Sukabumi City', 'Cirebon City',
    'Bandung City', 'Cimahi City', 'Tasikmalaya City', 'Banjar City',
  ];

  await prisma.city.deleteMany({});
  await prisma.city.createMany({
    data: cities.map((cityName) => ({ name: cityName })),
  });

  console.log(`✅ Seeded ${cities.length} Indonesian cities`);
}
