<?php

namespace Database\Seeders;

use App\Models\SkiResort;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SkiResortSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $resorts = [
            [
                'name' => 'Zermatt',
                'slug' => 'zermatt',
                'lat' => 46.0207,
                'lng' => 7.7491,
                'elevation_min' => 1620,
                'elevation_max' => 3883,
                'canton' => 'VS',
                'website_url' => 'https://www.zermatt.ch',
            ],
            [
                'name' => 'Verbier',
                'slug' => 'verbier',
                'lat' => 46.0963,
                'lng' => 7.2286,
                'elevation_min' => 1500,
                'elevation_max' => 3330,
                'canton' => 'VS',
                'website_url' => 'https://www.verbier.ch',
            ],
            [
                'name' => 'St. Moritz',
                'slug' => 'st-moritz',
                'lat' => 46.4908,
                'lng' => 9.8355,
                'elevation_min' => 1800,
                'elevation_max' => 3303,
                'canton' => 'GR',
                'website_url' => 'https://www.stmoritz.ch',
            ],
            [
                'name' => 'Davos',
                'slug' => 'davos',
                'lat' => 46.8005,
                'lng' => 9.8368,
                'elevation_min' => 1560,
                'elevation_max' => 2844,
                'canton' => 'GR',
                'website_url' => 'https://www.davos.ch',
            ],
            [
                'name' => 'Engelberg',
                'slug' => 'engelberg',
                'lat' => 46.8237,
                'lng' => 8.4059,
                'elevation_min' => 1050,
                'elevation_max' => 3020,
                'canton' => 'OW',
                'website_url' => 'https://www.engelberg.ch',
            ],
            [
                'name' => 'Grindelwald',
                'slug' => 'grindelwald',
                'lat' => 46.6237,
                'lng' => 8.0411,
                'elevation_min' => 1034,
                'elevation_max' => 2971,
                'canton' => 'BE',
                'website_url' => 'https://www.grindelwald.ch',
            ],
            [
                'name' => 'Saas-Fee',
                'slug' => 'saas-fee',
                'lat' => 46.1099,
                'lng' => 7.9295,
                'elevation_min' => 1800,
                'elevation_max' => 3600,
                'canton' => 'VS',
                'website_url' => 'https://www.saas-fee.ch',
            ],
            [
                'name' => 'Laax',
                'slug' => 'laax',
                'lat' => 46.7976,
                'lng' => 9.2614,
                'elevation_min' => 1100,
                'elevation_max' => 3018,
                'canton' => 'GR',
                'website_url' => 'https://www.laax.com',
            ],
            [
                'name' => 'Andermatt',
                'slug' => 'andermatt',
                'lat' => 46.6352,
                'lng' => 8.5942,
                'elevation_min' => 1444,
                'elevation_max' => 2961,
                'canton' => 'UR',
                'website_url' => 'https://www.andermatt.ch',
            ],
            [
                'name' => 'Lenzerheide',
                'slug' => 'lenzerheide',
                'lat' => 46.7285,
                'lng' => 9.5564,
                'elevation_min' => 1229,
                'elevation_max' => 2865,
                'canton' => 'GR',
                'website_url' => 'https://www.lenzerheide.com',
            ],
            [
                'name' => 'Adelboden',
                'slug' => 'adelboden',
                'lat' => 46.4920,
                'lng' => 7.5604,
                'elevation_min' => 1350,
                'elevation_max' => 2362,
                'canton' => 'BE',
                'website_url' => 'https://www.adelboden.ch',
            ],
            [
                'name' => 'Wengen',
                'slug' => 'wengen',
                'lat' => 46.6049,
                'lng' => 7.9221,
                'elevation_min' => 1274,
                'elevation_max' => 2971,
                'canton' => 'BE',
                'website_url' => 'https://www.wengen.ch',
            ],
            [
                'name' => 'Crans-Montana',
                'slug' => 'crans-montana',
                'lat' => 46.3114,
                'lng' => 7.4865,
                'elevation_min' => 1500,
                'elevation_max' => 3000,
                'canton' => 'VS',
                'website_url' => 'https://www.crans-montana.ch',
            ],
            [
                'name' => 'Arosa',
                'slug' => 'arosa',
                'lat' => 46.7826,
                'lng' => 9.6739,
                'elevation_min' => 1740,
                'elevation_max' => 2653,
                'canton' => 'GR',
                'website_url' => 'https://www.arosa.ch',
            ],
            [
                'name' => 'Gstaad',
                'slug' => 'gstaad',
                'lat' => 46.4753,
                'lng' => 7.2865,
                'elevation_min' => 1050,
                'elevation_max' => 3000,
                'canton' => 'BE',
                'website_url' => 'https://www.gstaad.ch',
            ],
        ];

        foreach ($resorts as $resort) {
            SkiResort::updateOrCreate(
                ['slug' => $resort['slug']],
                $resort
            );
        }
    }
}
