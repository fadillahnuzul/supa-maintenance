<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MaterialsSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            DB::statement('TRUNCATE TABLE "core"."materials" RESTART IDENTITY CASCADE');

            DB::unprepared(<<<'SQL'
INSERT INTO "core"."materials" ("id", "name", "name_indonesian", "deleted_at") VALUES
	(1, 'Andaliman Pepper', 'Andaliman', NULL),
	(2, 'Basil', 'Kemangi', NULL),
	(3, 'Bay Leaves', 'Daun Salam', NULL),
	(4, 'Black Cumin', 'Jintan Hitam', NULL),
	(5, 'Black Mustard Seeds', 'Biji Mustard Hitam', NULL),
	(6, 'Black Pepper', 'Lada Hitam', NULL),
	(7, 'Byadgi Chili', 'Cabai Byadgi', NULL),
	(8, 'Caraway', 'Jintan Karawai', NULL),
	(9, 'Cardamom', 'Kapulaga', NULL),
	(10, 'Cashew KAB', 'Kacang Mete KAB', NULL),
	(11, 'Cashew KAU', 'Kacang Mete KAU', NULL),
	(12, 'Cashew LP', 'Kacang Mete LP', NULL),
	(13, 'Cashew LWP', 'Kacang Mete LWP', NULL),
	(14, 'Cashew Nut/OC Whole', 'Kacang Mete/OC Utuh', NULL),
	(15, 'Cashew SW', 'Kacang Mete SW', NULL),
	(16, 'Chili Flakes', 'Cabai Flakes', NULL),
	(17, 'Chili Rings', 'Cabai Cincin', NULL),
	(18, 'Cinnamon Longstick', 'Kayu Manis Batang Panjang', NULL),
	(19, 'Cinnamon Asalan Jawa', 'Kayu Manis Asalan Jawa', NULL),
	(20, 'Cinnamon Asalan Kerinci', 'Kayu Manis Asalan Kerinci', NULL),
	(21, 'Clove Stems', 'Gagang Cengkeh', NULL),
	(22, 'Cloves', 'Cengkeh', NULL),
	(23, 'Coriander', 'Ketumbar', NULL),
	(24, 'Corn', 'Jagung', NULL),
	(25, 'Corn Flour', 'Tepung Jagung', NULL),
	(26, 'Cornstarch', 'Tepung Maizena', NULL),
	(27, 'Cubeb Pepper', 'Kemukus', NULL),
	(28, 'Cumin', 'Jintan', NULL),
	(29, 'Curry Leaves', 'Daun Kari', NULL),
	(30, 'Dried Lemongrass', 'Serai Kering', NULL),
	(31, 'Dried Paprika', 'Paprika Kering', NULL),
	(32, 'Dried Sliced Turmeric', 'Irisan Kunyit Kering', NULL),
	(33, 'Fennel', 'Adas', NULL),
	(34, 'Fenugreek', 'Kelabat', NULL),
	(35, 'Fresh Garlic', 'Bawang Putih Segar', NULL),
	(36, 'Fresh Lemongrass', 'Serai Segar', NULL),
	(37, 'Galangal', 'Lengkuas', NULL),
	(38, 'Garlic Flakes', 'Bawang Putih Flakes', NULL),
	(39, 'Gendot Chili Pepper', 'Cabai Gendot', NULL),
	(40, 'Ginger Dried', 'Jahe Kering', NULL),
	(41, 'Ginger Emprit Dried', 'Jahe Emprit Kering', NULL),
	(42, 'Green Cardamom', 'Kapulaga Hijau', NULL),
	(43, 'Java Almond', 'Kenari Jawa', NULL),
	(44, 'Kaffir Lime Leaves', 'Daun Jeruk Purut', NULL),
	(45, 'Kimchi Chili Powder', 'Bubuk Cabai Kimchi', NULL),
	(46, 'Kluwek', 'Kluwek', NULL),
	(47, 'Laurel', 'Daun Laurel', NULL),
	(48, 'Leek Flakes', 'Daun Bawang Flakes', NULL),
	(49, 'Long Pepper', 'Cabai Jawa', NULL),
	(50, 'Mace', 'Bunga Pala', NULL),
	(51, 'Nutmeg ABC', 'Pala ABC', NULL),
	(52, 'Nutmeg BWP', 'Pala BWP', NULL),
	(53, 'Nutmeg Lubang Jarum', 'Pala Lubang Jarum', NULL),
	(54, 'Nutmeg Skin', 'Kulit Pala', NULL),
	(55, 'Onion Flakes', 'Bawang Bombay Flakes', NULL),
	(56, 'Oregano', 'Oregano', NULL),
	(57, 'Pandan Leaves', 'Daun Pandan', NULL),
	(58, 'Paprika Powder', 'Bubuk Paprika', NULL),
	(59, 'Parsley', 'Peterseli', NULL),
	(60, 'Pink Onion Flakes', 'Bawang Merah Muda Flakes', NULL),
	(61, 'Red Ginger Dried', 'Jahe Merah Kering', NULL),
	(62, 'Red Onion Flakes', 'Bawang Merah Flakes', NULL),
	(63, 'Rosemary', 'Rosemary', NULL),
	(64, 'Sliced Curcuma', 'Irisan Temulawak', NULL),
	(65, 'Split Candlenuts', 'Kemiri Belah', NULL),
	(66, 'Split Cashew Kernels', 'Kacang Mete Belah', NULL),
	(67, 'Tamarind', 'Asam Jawa', NULL),
	(68, 'Tapioca Flour', 'Tepung Tapioka', NULL),
	(69, 'Teja Chili', 'Cabai Teja', NULL),
	(70, 'Thyme', 'Thyme', NULL),
	(71, 'Turmeric Leaves', 'Daun Kunyit', NULL),
	(72, 'White Pepper', 'Lada Putih', NULL),
	(73, 'Whole Candlenuts', 'Kemiri Utuh', NULL),
	(74, 'Whole Star Anise', 'Bunga Lawang Utuh', NULL),
	(75, 'Wonderhot Chili', 'Cabai Wonderhot', NULL),
	(76, 'Yellow Mustard Seeds', 'Biji Mustard Kuning', NULL),
	(77, 'Zedoary', 'Temu Putih', NULL);
SQL
            );

            DB::statement(
                'SELECT setval(pg_get_serial_sequence(\'core.materials\', \'id\'), COALESCE((SELECT MAX(id) FROM "core"."materials"), 1), true)'
            );
        });
    }
}
