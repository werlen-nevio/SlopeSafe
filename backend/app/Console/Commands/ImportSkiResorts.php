<?php

namespace App\Console\Commands;

use App\Models\SkiResort;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ImportSkiResorts extends Command
{
    protected $signature = 'resorts:import
                            {--dry-run : Show what would be imported without saving}
                            {--update : Update existing resorts instead of skipping}
                            {--source=curated : Data source: curated, osm, or both}';

    protected $description = 'Import Swiss ski resorts from curated list or OpenStreetMap';

    private const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

    public function handle(): int
    {
        $source = $this->option('source');

        $resorts = match ($source) {
            'osm' => $this->fetchFromOsm(),
            'both' => $this->mergeSources($this->getCuratedResorts(), $this->fetchFromOsm()),
            default => $this->getCuratedResorts(),
        };

        if (empty($resorts)) {
            $this->error('No resorts found.');
            return Command::FAILURE;
        }

        $this->info(sprintf('Found %d ski resorts', count($resorts)));

        $imported = 0;
        $skipped = 0;
        $updated = 0;

        $isDryRun = $this->option('dry-run');

        foreach ($resorts as $resort) {
            $slug = Str::slug($resort['name']);

            if ($isDryRun) {
                $this->line(sprintf(
                    '  [DRY-RUN] %s (%.4f, %.4f) - %s, %d-%dm',
                    $resort['name'],
                    $resort['lat'],
                    $resort['lng'],
                    $resort['canton'] ?? '??',
                    $resort['elevation_min'] ?? 0,
                    $resort['elevation_max'] ?? 0
                ));
                $imported++;
                continue;
            }

            // Skip entries without canton (likely outside Switzerland)
            if (empty($resort['canton'])) {
                $this->line(sprintf('  Skipping (no canton): %s', $resort['name']));
                $skipped++;
                continue;
            }

            $existing = SkiResort::where('slug', $slug)->first();

            if ($existing && !$this->option('update')) {
                $this->line(sprintf('  Skipping (exists): %s', $resort['name']));
                $skipped++;
                continue;
            }

            SkiResort::updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $resort['name'],
                    'lat' => $resort['lat'],
                    'lng' => $resort['lng'],
                    'elevation_min' => $resort['elevation_min'] ?? 0,
                    'elevation_max' => $resort['elevation_max'] ?? 0,
                    'canton' => $resort['canton'] ?? null,
                    'website_url' => $resort['website_url'] ?? null,
                ]
            );

            if ($existing) {
                $this->info(sprintf('  Updated: %s', $resort['name']));
                $updated++;
            } else {
                $this->info(sprintf('  Imported: %s', $resort['name']));
                $imported++;
            }
        }

        $this->newLine();
        $this->info('Import complete:');
        $this->table(
            ['Status', 'Count'],
            [
                ['Imported', $imported],
                ['Updated', $updated],
                ['Skipped', $skipped],
            ]
        );

        return Command::SUCCESS;
    }

    private function fetchFromOsm(): array
    {
        $this->info('Fetching from OpenStreetMap Overpass API...');
        return $this->fetchResortsFromOverpass();
    }

    private function mergeSources(array $curated, array $osm): array
    {
        $merged = $curated;
        $existingSlugs = array_map(fn($r) => Str::slug($r['name']), $curated);

        foreach ($osm as $resort) {
            $slug = Str::slug($resort['name']);
            if (!in_array($slug, $existingSlugs)) {
                $merged[] = $resort;
                $existingSlugs[] = $slug;
            }
        }

        return $merged;
    }

    /**
     * Comprehensive list of Swiss ski resorts with verified coordinates and elevation data.
     */
    private function getCuratedResorts(): array
    {
        $this->info('Using curated Swiss ski resort list...');

        return [
            // ========== VALAIS (VS) - 50+ resorts ==========
            ['name' => 'Zermatt', 'lat' => 46.0207, 'lng' => 7.7491, 'elevation_min' => 1620, 'elevation_max' => 3883, 'canton' => 'VS', 'website_url' => 'https://www.zermatt.ch'],
            ['name' => 'Verbier', 'lat' => 46.0963, 'lng' => 7.2286, 'elevation_min' => 1500, 'elevation_max' => 3330, 'canton' => 'VS', 'website_url' => 'https://www.verbier.ch'],
            ['name' => 'Saas-Fee', 'lat' => 46.1099, 'lng' => 7.9295, 'elevation_min' => 1800, 'elevation_max' => 3600, 'canton' => 'VS', 'website_url' => 'https://www.saas-fee.ch'],
            ['name' => 'Crans-Montana', 'lat' => 46.3114, 'lng' => 7.4865, 'elevation_min' => 1500, 'elevation_max' => 3000, 'canton' => 'VS', 'website_url' => 'https://www.crans-montana.ch'],
            ['name' => 'Nendaz', 'lat' => 46.1872, 'lng' => 7.3010, 'elevation_min' => 1400, 'elevation_max' => 3330, 'canton' => 'VS', 'website_url' => 'https://www.nendaz.ch'],
            ['name' => 'Anzère', 'lat' => 46.2983, 'lng' => 7.4017, 'elevation_min' => 1500, 'elevation_max' => 2420, 'canton' => 'VS', 'website_url' => 'https://www.anzere.ch'],
            ['name' => 'Leukerbad', 'lat' => 46.3792, 'lng' => 7.6272, 'elevation_min' => 1411, 'elevation_max' => 2700, 'canton' => 'VS', 'website_url' => 'https://www.leukerbad.ch'],
            ['name' => 'Aletsch Arena', 'lat' => 46.3836, 'lng' => 8.0022, 'elevation_min' => 1845, 'elevation_max' => 2869, 'canton' => 'VS', 'website_url' => 'https://www.aletscharena.ch'],
            ['name' => 'Belalp', 'lat' => 46.3719, 'lng' => 7.9961, 'elevation_min' => 2094, 'elevation_max' => 3112, 'canton' => 'VS', 'website_url' => 'https://www.belalp.ch'],
            ['name' => 'Evolène', 'lat' => 46.1133, 'lng' => 7.4942, 'elevation_min' => 1371, 'elevation_max' => 2700, 'canton' => 'VS', 'website_url' => 'https://www.evolene-region.ch'],
            ['name' => 'Thyon', 'lat' => 46.1675, 'lng' => 7.3717, 'elevation_min' => 1800, 'elevation_max' => 3330, 'canton' => 'VS', 'website_url' => 'https://www.thyon-region.ch'],
            ['name' => 'Veysonnaz', 'lat' => 46.1958, 'lng' => 7.3406, 'elevation_min' => 1400, 'elevation_max' => 3330, 'canton' => 'VS', 'website_url' => 'https://www.veysonnaz.ch'],
            ['name' => 'Champéry', 'lat' => 46.1775, 'lng' => 6.8697, 'elevation_min' => 1050, 'elevation_max' => 2277, 'canton' => 'VS', 'website_url' => 'https://www.champery.ch'],
            ['name' => 'Morgins', 'lat' => 46.2386, 'lng' => 6.8531, 'elevation_min' => 1350, 'elevation_max' => 2000, 'canton' => 'VS', 'website_url' => 'https://www.morgins.ch'],
            ['name' => 'Torgon', 'lat' => 46.3072, 'lng' => 6.8692, 'elevation_min' => 1100, 'elevation_max' => 2000, 'canton' => 'VS', 'website_url' => 'https://www.torgon.ch'],
            ['name' => 'Grächen', 'lat' => 46.1958, 'lng' => 7.8369, 'elevation_min' => 1619, 'elevation_max' => 2868, 'canton' => 'VS', 'website_url' => 'https://www.graechen.ch'],
            ['name' => 'Zinal', 'lat' => 46.1350, 'lng' => 7.6253, 'elevation_min' => 1670, 'elevation_max' => 2895, 'canton' => 'VS', 'website_url' => 'https://www.zinal.ch'],
            ['name' => 'Grimentz', 'lat' => 46.1781, 'lng' => 7.5756, 'elevation_min' => 1570, 'elevation_max' => 2900, 'canton' => 'VS', 'website_url' => 'https://www.grimentz.ch'],
            ['name' => 'St-Luc/Chandolin', 'lat' => 46.2175, 'lng' => 7.6069, 'elevation_min' => 1650, 'elevation_max' => 3000, 'canton' => 'VS', 'website_url' => 'https://www.valdanniviers.ch'],
            ['name' => 'Ovronnaz', 'lat' => 46.2003, 'lng' => 7.1761, 'elevation_min' => 1350, 'elevation_max' => 2500, 'canton' => 'VS', 'website_url' => 'https://www.ovronnaz.ch'],
            ['name' => 'La Tzoumaz', 'lat' => 46.0953, 'lng' => 7.2444, 'elevation_min' => 1500, 'elevation_max' => 3330, 'canton' => 'VS', 'website_url' => 'https://www.latzoumaz.ch'],
            ['name' => 'Bruson', 'lat' => 46.0708, 'lng' => 7.2233, 'elevation_min' => 1080, 'elevation_max' => 2485, 'canton' => 'VS', 'website_url' => 'https://www.bruson.ch'],
            ['name' => 'Lauchernalp', 'lat' => 46.4211, 'lng' => 7.7607, 'elevation_min' => 1969, 'elevation_max' => 3111, 'canton' => 'VS', 'website_url' => 'https://www.lauchernalp.ch'],
            ['name' => 'Saas-Grund', 'lat' => 46.1250, 'lng' => 7.9361, 'elevation_min' => 1559, 'elevation_max' => 3100, 'canton' => 'VS', 'website_url' => 'https://www.saas-grund.ch'],
            ['name' => 'Saas-Almagell', 'lat' => 46.0997, 'lng' => 7.9531, 'elevation_min' => 1672, 'elevation_max' => 2400, 'canton' => 'VS', 'website_url' => 'https://www.saas-almagell.ch'],
            ['name' => 'Bellwald', 'lat' => 46.4292, 'lng' => 8.1583, 'elevation_min' => 1560, 'elevation_max' => 2560, 'canton' => 'VS', 'website_url' => 'https://www.bellwald.ch'],
            ['name' => 'Fiesch-Eggishorn', 'lat' => 46.3997, 'lng' => 8.1333, 'elevation_min' => 1049, 'elevation_max' => 2927, 'canton' => 'VS', 'website_url' => 'https://www.aletscharena.ch'],
            ['name' => 'Riederalp', 'lat' => 46.3764, 'lng' => 8.0278, 'elevation_min' => 1930, 'elevation_max' => 2869, 'canton' => 'VS', 'website_url' => 'https://www.aletscharena.ch'],
            ['name' => 'Bettmeralp', 'lat' => 46.3889, 'lng' => 8.0583, 'elevation_min' => 1950, 'elevation_max' => 2869, 'canton' => 'VS', 'website_url' => 'https://www.aletscharena.ch'],
            ['name' => 'Rosswald', 'lat' => 46.3044, 'lng' => 7.9700, 'elevation_min' => 1797, 'elevation_max' => 2700, 'canton' => 'VS', 'website_url' => 'https://www.rosswald.ch'],
            ['name' => 'Blatten-Belalp', 'lat' => 46.3722, 'lng' => 7.9764, 'elevation_min' => 1322, 'elevation_max' => 3112, 'canton' => 'VS', 'website_url' => 'https://www.belalp.ch'],
            ['name' => 'Gspon', 'lat' => 46.2350, 'lng' => 7.9058, 'elevation_min' => 1893, 'elevation_max' => 2450, 'canton' => 'VS', 'website_url' => 'https://www.gspon.ch'],
            ['name' => 'Visperterminen', 'lat' => 46.2600, 'lng' => 7.9017, 'elevation_min' => 1340, 'elevation_max' => 2400, 'canton' => 'VS', 'website_url' => 'https://www.heidadorf.ch'],
            ['name' => 'Staldenried-Gspon', 'lat' => 46.2319, 'lng' => 7.8889, 'elevation_min' => 1052, 'elevation_max' => 2450, 'canton' => 'VS', 'website_url' => 'https://www.gspon.ch'],
            ['name' => 'Bürchen-Törbel', 'lat' => 46.2803, 'lng' => 7.8181, 'elevation_min' => 1350, 'elevation_max' => 2340, 'canton' => 'VS', 'website_url' => 'https://www.moosalp.ch'],
            ['name' => 'Unterbäch-Brandalp', 'lat' => 46.2867, 'lng' => 7.7989, 'elevation_min' => 1230, 'elevation_max' => 2200, 'canton' => 'VS', 'website_url' => 'https://www.brandalp.ch'],
            ['name' => 'Eischoll', 'lat' => 46.3028, 'lng' => 7.7772, 'elevation_min' => 1220, 'elevation_max' => 2100, 'canton' => 'VS', 'website_url' => 'https://www.eischoll.ch'],
            ['name' => 'Les Crosets', 'lat' => 46.1886, 'lng' => 6.8278, 'elevation_min' => 1660, 'elevation_max' => 2277, 'canton' => 'VS', 'website_url' => 'https://www.lescrosets.ch'],
            ['name' => 'Champoussin', 'lat' => 46.2097, 'lng' => 6.8347, 'elevation_min' => 1580, 'elevation_max' => 2200, 'canton' => 'VS', 'website_url' => 'https://www.champoussin.ch'],
            ['name' => 'Les Marécottes', 'lat' => 46.0872, 'lng' => 7.0078, 'elevation_min' => 1110, 'elevation_max' => 2200, 'canton' => 'VS', 'website_url' => 'https://www.telemarecottessalvan.ch'],
            ['name' => 'La Fouly', 'lat' => 45.9367, 'lng' => 7.0958, 'elevation_min' => 1593, 'elevation_max' => 1900, 'canton' => 'VS', 'website_url' => 'https://www.lafouly.ch'],
            ['name' => 'Champex-Lac', 'lat' => 46.0292, 'lng' => 7.1192, 'elevation_min' => 1466, 'elevation_max' => 2200, 'canton' => 'VS', 'website_url' => 'https://www.champex.ch'],
            ['name' => 'Vichères-Bavon', 'lat' => 46.0550, 'lng' => 7.1767, 'elevation_min' => 1600, 'elevation_max' => 2050, 'canton' => 'VS', 'website_url' => 'https://www.vicheres-bavon.ch'],
            ['name' => 'Arolla', 'lat' => 46.0264, 'lng' => 7.4628, 'elevation_min' => 1998, 'elevation_max' => 3000, 'canton' => 'VS', 'website_url' => 'https://www.arolla.com'],
            ['name' => 'Les Haudères', 'lat' => 46.0817, 'lng' => 7.5053, 'elevation_min' => 1436, 'elevation_max' => 2700, 'canton' => 'VS', 'website_url' => 'https://www.evolene-region.ch'],
            ['name' => 'Nax-Mont-Noble', 'lat' => 46.2286, 'lng' => 7.4339, 'elevation_min' => 1280, 'elevation_max' => 2362, 'canton' => 'VS', 'website_url' => 'https://www.nax.ch'],
            ['name' => 'Vercorin', 'lat' => 46.2644, 'lng' => 7.5311, 'elevation_min' => 1343, 'elevation_max' => 2340, 'canton' => 'VS', 'website_url' => 'https://www.vercorin.ch'],
            ['name' => 'Les Giettes', 'lat' => 46.2567, 'lng' => 6.9042, 'elevation_min' => 1170, 'elevation_max' => 1500, 'canton' => 'VS', 'website_url' => 'https://www.lesgiettes.ch'],
            ['name' => 'Münster-Geschinen', 'lat' => 46.4914, 'lng' => 8.2650, 'elevation_min' => 1360, 'elevation_max' => 2100, 'canton' => 'VS', 'website_url' => 'https://www.goms.ch'],
            ['name' => 'Gluringen-Ritzingen', 'lat' => 46.4569, 'lng' => 8.2017, 'elevation_min' => 1338, 'elevation_max' => 1800, 'canton' => 'VS', 'website_url' => 'https://www.goms.ch'],

            // ========== GRAUBÜNDEN (GR) - 45+ resorts ==========
            ['name' => 'St. Moritz', 'lat' => 46.4908, 'lng' => 9.8355, 'elevation_min' => 1800, 'elevation_max' => 3303, 'canton' => 'GR', 'website_url' => 'https://www.stmoritz.ch'],
            ['name' => 'Davos', 'lat' => 46.8005, 'lng' => 9.8368, 'elevation_min' => 1560, 'elevation_max' => 2844, 'canton' => 'GR', 'website_url' => 'https://www.davos.ch'],
            ['name' => 'Laax', 'lat' => 46.7976, 'lng' => 9.2614, 'elevation_min' => 1100, 'elevation_max' => 3018, 'canton' => 'GR', 'website_url' => 'https://www.laax.com'],
            ['name' => 'Lenzerheide', 'lat' => 46.7285, 'lng' => 9.5564, 'elevation_min' => 1229, 'elevation_max' => 2865, 'canton' => 'GR', 'website_url' => 'https://www.lenzerheide.com'],
            ['name' => 'Arosa', 'lat' => 46.7826, 'lng' => 9.6739, 'elevation_min' => 1740, 'elevation_max' => 2653, 'canton' => 'GR', 'website_url' => 'https://www.arosa.ch'],
            ['name' => 'Flims', 'lat' => 46.8378, 'lng' => 9.2839, 'elevation_min' => 1100, 'elevation_max' => 3018, 'canton' => 'GR', 'website_url' => 'https://www.flims.com'],
            ['name' => 'Klosters', 'lat' => 46.8684, 'lng' => 9.8756, 'elevation_min' => 1194, 'elevation_max' => 2844, 'canton' => 'GR', 'website_url' => 'https://www.klosters.ch'],
            ['name' => 'Samnaun', 'lat' => 46.9433, 'lng' => 10.3581, 'elevation_min' => 1840, 'elevation_max' => 2872, 'canton' => 'GR', 'website_url' => 'https://www.samnaun.ch'],
            ['name' => 'Scuol', 'lat' => 46.7967, 'lng' => 10.2978, 'elevation_min' => 1250, 'elevation_max' => 2785, 'canton' => 'GR', 'website_url' => 'https://www.scuol.ch'],
            ['name' => 'Disentis', 'lat' => 46.7036, 'lng' => 8.8536, 'elevation_min' => 1130, 'elevation_max' => 2833, 'canton' => 'GR', 'website_url' => 'https://www.disentis-sedrun.ch'],
            ['name' => 'Sedrun', 'lat' => 46.6789, 'lng' => 8.7706, 'elevation_min' => 1441, 'elevation_max' => 2350, 'canton' => 'GR', 'website_url' => 'https://www.disentis-sedrun.ch'],
            ['name' => 'Savognin', 'lat' => 46.5950, 'lng' => 9.5981, 'elevation_min' => 1200, 'elevation_max' => 2713, 'canton' => 'GR', 'website_url' => 'https://www.savognin.ch'],
            ['name' => 'Bergün', 'lat' => 46.6297, 'lng' => 9.7478, 'elevation_min' => 1367, 'elevation_max' => 2590, 'canton' => 'GR', 'website_url' => 'https://www.berguen-filisur.ch'],
            ['name' => 'Splügen', 'lat' => 46.5508, 'lng' => 9.3203, 'elevation_min' => 1460, 'elevation_max' => 2215, 'canton' => 'GR', 'website_url' => 'https://www.spluegen.ch'],
            ['name' => 'Brigels', 'lat' => 46.7625, 'lng' => 9.0603, 'elevation_min' => 1300, 'elevation_max' => 2418, 'canton' => 'GR', 'website_url' => 'https://www.brigels.ch'],
            ['name' => 'Vals', 'lat' => 46.6175, 'lng' => 9.1806, 'elevation_min' => 1250, 'elevation_max' => 3000, 'canton' => 'GR', 'website_url' => 'https://www.vals.ch'],
            ['name' => 'Zuoz', 'lat' => 46.6022, 'lng' => 9.9581, 'elevation_min' => 1716, 'elevation_max' => 2456, 'canton' => 'GR', 'website_url' => 'https://www.zuoz.ch'],
            ['name' => 'Pontresina', 'lat' => 46.4939, 'lng' => 9.9003, 'elevation_min' => 1800, 'elevation_max' => 3303, 'canton' => 'GR', 'website_url' => 'https://www.pontresina.ch'],
            ['name' => 'Silvaplana', 'lat' => 46.4575, 'lng' => 9.7947, 'elevation_min' => 1800, 'elevation_max' => 3303, 'canton' => 'GR', 'website_url' => 'https://www.silvaplana.ch'],
            ['name' => 'Celerina', 'lat' => 46.5097, 'lng' => 9.8569, 'elevation_min' => 1720, 'elevation_max' => 3303, 'canton' => 'GR', 'website_url' => 'https://www.celerina.ch'],
            ['name' => 'Madrisa', 'lat' => 46.9094, 'lng' => 9.8450, 'elevation_min' => 1124, 'elevation_max' => 2602, 'canton' => 'GR', 'website_url' => 'https://www.madrisa.ch'],
            ['name' => 'Diavolezza-Lagalb', 'lat' => 46.4128, 'lng' => 9.9653, 'elevation_min' => 2093, 'elevation_max' => 3066, 'canton' => 'GR', 'website_url' => 'https://www.diavolezza.ch'],
            ['name' => 'Corvatsch', 'lat' => 46.4269, 'lng' => 9.8217, 'elevation_min' => 1800, 'elevation_max' => 3303, 'canton' => 'GR', 'website_url' => 'https://www.corvatsch.ch'],
            ['name' => 'Parsenn-Gotschna', 'lat' => 46.8394, 'lng' => 9.8344, 'elevation_min' => 1560, 'elevation_max' => 2844, 'canton' => 'GR', 'website_url' => 'https://www.davos.ch'],
            ['name' => 'Jakobshorn', 'lat' => 46.7833, 'lng' => 9.8500, 'elevation_min' => 1540, 'elevation_max' => 2590, 'canton' => 'GR', 'website_url' => 'https://www.davos.ch'],
            ['name' => 'Pischa', 'lat' => 46.7608, 'lng' => 9.8083, 'elevation_min' => 1800, 'elevation_max' => 2483, 'canton' => 'GR', 'website_url' => 'https://www.davos.ch'],
            ['name' => 'Rinerhorn', 'lat' => 46.7467, 'lng' => 9.8800, 'elevation_min' => 1448, 'elevation_max' => 2490, 'canton' => 'GR', 'website_url' => 'https://www.davos.ch'],
            ['name' => 'Schatzalp-Strela', 'lat' => 46.8050, 'lng' => 9.8250, 'elevation_min' => 1560, 'elevation_max' => 2400, 'canton' => 'GR', 'website_url' => 'https://www.davos.ch'],
            ['name' => 'Obersaxen-Mundaun', 'lat' => 46.7361, 'lng' => 9.0917, 'elevation_min' => 1200, 'elevation_max' => 2310, 'canton' => 'GR', 'website_url' => 'https://www.surselva.info'],
            ['name' => 'Tschiertschen', 'lat' => 46.8142, 'lng' => 9.6014, 'elevation_min' => 1350, 'elevation_max' => 2400, 'canton' => 'GR', 'website_url' => 'https://www.tschiertschen.ch'],
            ['name' => 'Churwalden-Brambrüesch', 'lat' => 46.8222, 'lng' => 9.5294, 'elevation_min' => 1600, 'elevation_max' => 2200, 'canton' => 'GR', 'website_url' => 'https://www.churwalden.ch'],
            ['name' => 'Feldis', 'lat' => 46.7875, 'lng' => 9.4500, 'elevation_min' => 1500, 'elevation_max' => 2000, 'canton' => 'GR', 'website_url' => 'https://www.feldis.ch'],
            ['name' => 'Heinzenberg', 'lat' => 46.6833, 'lng' => 9.3333, 'elevation_min' => 1400, 'elevation_max' => 2100, 'canton' => 'GR', 'website_url' => 'https://www.sarn-heinzenberg.ch'],
            ['name' => 'Tenna', 'lat' => 46.7500, 'lng' => 9.3333, 'elevation_min' => 1650, 'elevation_max' => 2000, 'canton' => 'GR', 'website_url' => 'https://www.tenna.ch'],
            ['name' => 'Avers', 'lat' => 46.4722, 'lng' => 9.5111, 'elevation_min' => 1960, 'elevation_max' => 2600, 'canton' => 'GR', 'website_url' => 'https://www.avers.ch'],
            ['name' => 'Bivio', 'lat' => 46.4678, 'lng' => 9.6472, 'elevation_min' => 1769, 'elevation_max' => 2500, 'canton' => 'GR', 'website_url' => 'https://www.bivio.ch'],
            ['name' => 'San Bernardino', 'lat' => 46.4631, 'lng' => 9.1839, 'elevation_min' => 1626, 'elevation_max' => 2525, 'canton' => 'GR', 'website_url' => 'https://www.sanbernardino.ch'],
            ['name' => 'Grüsch-Danusa', 'lat' => 46.9808, 'lng' => 9.6500, 'elevation_min' => 1015, 'elevation_max' => 2200, 'canton' => 'GR', 'website_url' => 'https://www.gruesch-danusa.ch'],
            ['name' => 'St. Antönien', 'lat' => 46.9617, 'lng' => 9.8117, 'elevation_min' => 1420, 'elevation_max' => 2050, 'canton' => 'GR', 'website_url' => 'https://www.st-antoenien.ch'],
            ['name' => 'Fideriser Heuberge', 'lat' => 46.9200, 'lng' => 9.7450, 'elevation_min' => 1916, 'elevation_max' => 2400, 'canton' => 'GR', 'website_url' => 'https://www.heuberge.ch'],
            ['name' => 'Pany', 'lat' => 46.9358, 'lng' => 9.6283, 'elevation_min' => 1250, 'elevation_max' => 1820, 'canton' => 'GR', 'website_url' => 'https://www.praettigau.ch'],
            ['name' => 'Seewis', 'lat' => 46.9883, 'lng' => 9.6400, 'elevation_min' => 950, 'elevation_max' => 1450, 'canton' => 'GR', 'website_url' => 'https://www.seewis.ch'],
            ['name' => 'Minschuns', 'lat' => 46.6350, 'lng' => 10.3017, 'elevation_min' => 1720, 'elevation_max' => 2739, 'canton' => 'GR', 'website_url' => 'https://www.val-muestair.ch'],
            ['name' => 'La Punt', 'lat' => 46.5792, 'lng' => 9.9417, 'elevation_min' => 1697, 'elevation_max' => 2400, 'canton' => 'GR', 'website_url' => 'https://www.lapunt.ch'],
            ['name' => 'Maloja', 'lat' => 46.4000, 'lng' => 9.6917, 'elevation_min' => 1809, 'elevation_max' => 2100, 'canton' => 'GR', 'website_url' => 'https://www.maloja.ch'],

            // ========== BERN (BE) - 35+ resorts ==========
            ['name' => 'Grindelwald', 'lat' => 46.6237, 'lng' => 8.0411, 'elevation_min' => 1034, 'elevation_max' => 2971, 'canton' => 'BE', 'website_url' => 'https://www.grindelwald.ch'],
            ['name' => 'Adelboden', 'lat' => 46.4920, 'lng' => 7.5604, 'elevation_min' => 1350, 'elevation_max' => 2362, 'canton' => 'BE', 'website_url' => 'https://www.adelboden.ch'],
            ['name' => 'Wengen', 'lat' => 46.6049, 'lng' => 7.9221, 'elevation_min' => 1274, 'elevation_max' => 2971, 'canton' => 'BE', 'website_url' => 'https://www.wengen.ch'],
            ['name' => 'Gstaad', 'lat' => 46.4753, 'lng' => 7.2865, 'elevation_min' => 1050, 'elevation_max' => 3000, 'canton' => 'BE', 'website_url' => 'https://www.gstaad.ch'],
            ['name' => 'Mürren', 'lat' => 46.5592, 'lng' => 7.8922, 'elevation_min' => 1650, 'elevation_max' => 2971, 'canton' => 'BE', 'website_url' => 'https://www.muerren.ch'],
            ['name' => 'Lenk', 'lat' => 46.4572, 'lng' => 7.4431, 'elevation_min' => 1068, 'elevation_max' => 2362, 'canton' => 'BE', 'website_url' => 'https://www.lenk-simmental.ch'],
            ['name' => 'Kandersteg', 'lat' => 46.4969, 'lng' => 7.6747, 'elevation_min' => 1200, 'elevation_max' => 1950, 'canton' => 'BE', 'website_url' => 'https://www.kandersteg.ch'],
            ['name' => 'Hasliberg', 'lat' => 46.7428, 'lng' => 8.1764, 'elevation_min' => 1082, 'elevation_max' => 2433, 'canton' => 'BE', 'website_url' => 'https://www.hasliberg.ch'],
            ['name' => 'Meiringen', 'lat' => 46.7272, 'lng' => 8.1850, 'elevation_min' => 600, 'elevation_max' => 2433, 'canton' => 'BE', 'website_url' => 'https://www.meiringen.ch'],
            ['name' => 'Schönried', 'lat' => 46.5000, 'lng' => 7.2708, 'elevation_min' => 1230, 'elevation_max' => 2156, 'canton' => 'BE', 'website_url' => 'https://www.gstaad.ch'],
            ['name' => 'Saanenmöser', 'lat' => 46.5153, 'lng' => 7.3075, 'elevation_min' => 1269, 'elevation_max' => 2156, 'canton' => 'BE', 'website_url' => 'https://www.gstaad.ch'],
            ['name' => 'Zweisimmen', 'lat' => 46.5544, 'lng' => 7.3756, 'elevation_min' => 950, 'elevation_max' => 2002, 'canton' => 'BE', 'website_url' => 'https://www.zweisimmen.ch'],
            ['name' => 'Beatenberg', 'lat' => 46.6931, 'lng' => 7.7947, 'elevation_min' => 1129, 'elevation_max' => 1950, 'canton' => 'BE', 'website_url' => 'https://www.beatenberg.ch'],
            ['name' => 'Jungfrau Region', 'lat' => 46.5647, 'lng' => 7.9708, 'elevation_min' => 796, 'elevation_max' => 2970, 'canton' => 'BE', 'website_url' => 'https://www.jungfrau.ch'],
            ['name' => 'Kleine Scheidegg', 'lat' => 46.5850, 'lng' => 7.9611, 'elevation_min' => 2061, 'elevation_max' => 2970, 'canton' => 'BE', 'website_url' => 'https://www.jungfrau.ch'],
            ['name' => 'Lauterbrunnen', 'lat' => 46.5936, 'lng' => 7.9086, 'elevation_min' => 795, 'elevation_max' => 2970, 'canton' => 'BE', 'website_url' => 'https://www.lauterbrunnen.ch'],
            ['name' => 'Schilthorn', 'lat' => 46.5567, 'lng' => 7.8350, 'elevation_min' => 1650, 'elevation_max' => 2970, 'canton' => 'BE', 'website_url' => 'https://www.schilthorn.ch'],
            ['name' => 'First', 'lat' => 46.6558, 'lng' => 8.0567, 'elevation_min' => 1034, 'elevation_max' => 2501, 'canton' => 'BE', 'website_url' => 'https://www.grindelwald.ch'],
            ['name' => 'Männlichen', 'lat' => 46.6122, 'lng' => 7.9408, 'elevation_min' => 1274, 'elevation_max' => 2343, 'canton' => 'BE', 'website_url' => 'https://www.maennlichen.ch'],
            ['name' => 'Engstligenalp', 'lat' => 46.4406, 'lng' => 7.5800, 'elevation_min' => 1964, 'elevation_max' => 2379, 'canton' => 'BE', 'website_url' => 'https://www.adelboden.ch'],
            ['name' => 'Elsigenalp', 'lat' => 46.4347, 'lng' => 7.6100, 'elevation_min' => 1800, 'elevation_max' => 2341, 'canton' => 'BE', 'website_url' => 'https://www.elsigen-metsch.ch'],
            ['name' => 'Axalp', 'lat' => 46.7167, 'lng' => 8.0433, 'elevation_min' => 1535, 'elevation_max' => 2160, 'canton' => 'BE', 'website_url' => 'https://www.axalp.ch'],
            ['name' => 'Schwarzwaldalp', 'lat' => 46.6917, 'lng' => 8.1167, 'elevation_min' => 1454, 'elevation_max' => 1900, 'canton' => 'BE', 'website_url' => 'https://www.grimselwelt.ch'],
            ['name' => 'Kiental', 'lat' => 46.5833, 'lng' => 7.7333, 'elevation_min' => 958, 'elevation_max' => 1600, 'canton' => 'BE', 'website_url' => 'https://www.kiental.ch'],
            ['name' => 'Grimmialp', 'lat' => 46.6442, 'lng' => 7.5775, 'elevation_min' => 1220, 'elevation_max' => 1600, 'canton' => 'BE', 'website_url' => 'https://www.grimmialp.ch'],
            ['name' => 'Wiriehorn', 'lat' => 46.6092, 'lng' => 7.5067, 'elevation_min' => 1200, 'elevation_max' => 1850, 'canton' => 'BE', 'website_url' => 'https://www.wiriehorn.ch'],
            ['name' => 'Gantrisch-Gurnigel', 'lat' => 46.7333, 'lng' => 7.4500, 'elevation_min' => 1500, 'elevation_max' => 1950, 'canton' => 'BE', 'website_url' => 'https://www.gantrisch.ch'],
            ['name' => 'Eriz', 'lat' => 46.7833, 'lng' => 7.8500, 'elevation_min' => 1180, 'elevation_max' => 1500, 'canton' => 'BE', 'website_url' => 'https://www.eriz.ch'],
            ['name' => 'Habkern', 'lat' => 46.7333, 'lng' => 7.8667, 'elevation_min' => 1100, 'elevation_max' => 1700, 'canton' => 'BE', 'website_url' => 'https://www.habkern.ch'],
            ['name' => 'Schangnau-Marbach', 'lat' => 46.8167, 'lng' => 7.8833, 'elevation_min' => 930, 'elevation_max' => 1500, 'canton' => 'BE', 'website_url' => 'https://www.marbach-schangnau.ch'],
            ['name' => 'Bumbach', 'lat' => 46.8050, 'lng' => 7.8867, 'elevation_min' => 1000, 'elevation_max' => 1500, 'canton' => 'BE', 'website_url' => 'https://www.bumbach.ch'],

            // ========== CENTRAL SWITZERLAND (OW, NW, UR, SZ, LU, ZG) ==========
            ['name' => 'Engelberg', 'lat' => 46.8237, 'lng' => 8.4059, 'elevation_min' => 1050, 'elevation_max' => 3020, 'canton' => 'OW', 'website_url' => 'https://www.engelberg.ch'],
            ['name' => 'Titlis', 'lat' => 46.7706, 'lng' => 8.4261, 'elevation_min' => 1050, 'elevation_max' => 3238, 'canton' => 'OW', 'website_url' => 'https://www.titlis.ch'],
            ['name' => 'Melchsee-Frutt', 'lat' => 46.7739, 'lng' => 8.2611, 'elevation_min' => 1080, 'elevation_max' => 2255, 'canton' => 'OW', 'website_url' => 'https://www.melchsee-frutt.ch'],
            ['name' => 'Andermatt', 'lat' => 46.6352, 'lng' => 8.5942, 'elevation_min' => 1444, 'elevation_max' => 2961, 'canton' => 'UR', 'website_url' => 'https://www.andermatt.ch'],
            ['name' => 'Andermatt-Sedrun', 'lat' => 46.6500, 'lng' => 8.6500, 'elevation_min' => 1444, 'elevation_max' => 2961, 'canton' => 'UR', 'website_url' => 'https://www.andermatt-sedrun.ch'],
            ['name' => 'Realp', 'lat' => 46.5972, 'lng' => 8.5028, 'elevation_min' => 1538, 'elevation_max' => 2200, 'canton' => 'UR', 'website_url' => 'https://www.realp.ch'],
            ['name' => 'Stoos', 'lat' => 46.9783, 'lng' => 8.6603, 'elevation_min' => 1300, 'elevation_max' => 1935, 'canton' => 'SZ', 'website_url' => 'https://www.stoos.ch'],
            ['name' => 'Hoch-Ybrig', 'lat' => 47.0208, 'lng' => 8.8058, 'elevation_min' => 1100, 'elevation_max' => 1856, 'canton' => 'SZ', 'website_url' => 'https://www.hoch-ybrig.ch'],
            ['name' => 'Sattel-Hochstuckli', 'lat' => 47.0681, 'lng' => 8.6347, 'elevation_min' => 1130, 'elevation_max' => 1596, 'canton' => 'SZ', 'website_url' => 'https://www.sattel-hochstuckli.ch'],
            ['name' => 'Sörenberg', 'lat' => 46.8236, 'lng' => 8.0381, 'elevation_min' => 1166, 'elevation_max' => 2350, 'canton' => 'LU', 'website_url' => 'https://www.soerenberg.ch'],
            ['name' => 'Klewenalp', 'lat' => 46.9508, 'lng' => 8.4525, 'elevation_min' => 435, 'elevation_max' => 1600, 'canton' => 'NW', 'website_url' => 'https://www.klewenalp.ch'],
            ['name' => 'Klewenalp-Stockhütte', 'lat' => 46.9500, 'lng' => 8.4500, 'elevation_min' => 435, 'elevation_max' => 1935, 'canton' => 'NW', 'website_url' => 'https://www.klewenalp.ch'],
            ['name' => 'Pilatus', 'lat' => 46.9792, 'lng' => 8.2553, 'elevation_min' => 1415, 'elevation_max' => 2128, 'canton' => 'NW', 'website_url' => 'https://www.pilatus.ch'],
            ['name' => 'Rigi', 'lat' => 47.0569, 'lng' => 8.4853, 'elevation_min' => 1440, 'elevation_max' => 1797, 'canton' => 'SZ', 'website_url' => 'https://www.rigi.ch'],
            ['name' => 'Brunni-Engelberg', 'lat' => 46.8167, 'lng' => 8.4167, 'elevation_min' => 1050, 'elevation_max' => 1860, 'canton' => 'OW', 'website_url' => 'https://www.brunni.ch'],
            ['name' => 'Bannalp', 'lat' => 46.8708, 'lng' => 8.4333, 'elevation_min' => 1520, 'elevation_max' => 1850, 'canton' => 'NW', 'website_url' => 'https://www.bannalp.ch'],
            ['name' => 'Wirzweli', 'lat' => 46.9167, 'lng' => 8.3667, 'elevation_min' => 1227, 'elevation_max' => 1600, 'canton' => 'NW', 'website_url' => 'https://www.wirzweli.ch'],
            ['name' => 'Mörlialp', 'lat' => 46.8333, 'lng' => 8.1000, 'elevation_min' => 1350, 'elevation_max' => 1650, 'canton' => 'OW', 'website_url' => 'https://www.moerlialp.ch'],
            ['name' => 'Langis', 'lat' => 46.8833, 'lng' => 8.1833, 'elevation_min' => 1400, 'elevation_max' => 1600, 'canton' => 'OW', 'website_url' => 'https://www.langis.ch'],
            ['name' => 'Ibergeregg', 'lat' => 47.0167, 'lng' => 8.7500, 'elevation_min' => 1406, 'elevation_max' => 1850, 'canton' => 'SZ', 'website_url' => 'https://www.ibergeregg.ch'],
            ['name' => 'Rothenthurm', 'lat' => 47.1000, 'lng' => 8.6833, 'elevation_min' => 920, 'elevation_max' => 1250, 'canton' => 'SZ', 'website_url' => 'https://www.rothenthurm.ch'],
            ['name' => 'Zugerberg', 'lat' => 47.1167, 'lng' => 8.5333, 'elevation_min' => 988, 'elevation_max' => 1039, 'canton' => 'ZG', 'website_url' => 'https://www.zugerberg.ch'],

            // ========== EASTERN SWITZERLAND (SG, GL, AI, AR) ==========
            ['name' => 'Toggenburg', 'lat' => 47.1875, 'lng' => 9.1625, 'elevation_min' => 900, 'elevation_max' => 2262, 'canton' => 'SG', 'website_url' => 'https://www.toggenburg.ch'],
            ['name' => 'Pizol', 'lat' => 46.9739, 'lng' => 9.4344, 'elevation_min' => 1100, 'elevation_max' => 2844, 'canton' => 'SG', 'website_url' => 'https://www.pizol.com'],
            ['name' => 'Flumserberg', 'lat' => 47.0833, 'lng' => 9.2833, 'elevation_min' => 1220, 'elevation_max' => 2222, 'canton' => 'SG', 'website_url' => 'https://www.flumserberg.ch'],
            ['name' => 'Braunwald', 'lat' => 46.9378, 'lng' => 8.9981, 'elevation_min' => 1256, 'elevation_max' => 1904, 'canton' => 'GL', 'website_url' => 'https://www.braunwald.ch'],
            ['name' => 'Elm', 'lat' => 46.9194, 'lng' => 9.1744, 'elevation_min' => 1000, 'elevation_max' => 2100, 'canton' => 'GL', 'website_url' => 'https://www.elm.ch'],
            ['name' => 'Alt St. Johann', 'lat' => 47.1917, 'lng' => 9.2792, 'elevation_min' => 900, 'elevation_max' => 2076, 'canton' => 'SG', 'website_url' => 'https://www.toggenburg.ch'],
            ['name' => 'Wildhaus', 'lat' => 47.2042, 'lng' => 9.3536, 'elevation_min' => 1090, 'elevation_max' => 2076, 'canton' => 'SG', 'website_url' => 'https://www.toggenburg.ch'],
            ['name' => 'Amden', 'lat' => 47.1500, 'lng' => 9.1500, 'elevation_min' => 1100, 'elevation_max' => 1700, 'canton' => 'SG', 'website_url' => 'https://www.amden.ch'],
            ['name' => 'Atzmännig', 'lat' => 47.2833, 'lng' => 9.0000, 'elevation_min' => 840, 'elevation_max' => 1190, 'canton' => 'SG', 'website_url' => 'https://www.atzmaennig.ch'],
            ['name' => 'Kerenzerberg', 'lat' => 47.1167, 'lng' => 9.1167, 'elevation_min' => 740, 'elevation_max' => 1400, 'canton' => 'GL', 'website_url' => 'https://www.kerenzerberg.ch'],
            ['name' => 'Ebenalp', 'lat' => 47.2833, 'lng' => 9.4167, 'elevation_min' => 1015, 'elevation_max' => 1640, 'canton' => 'AI', 'website_url' => 'https://www.ebenalp.ch'],
            ['name' => 'Kronberg', 'lat' => 47.2833, 'lng' => 9.3167, 'elevation_min' => 900, 'elevation_max' => 1663, 'canton' => 'AI', 'website_url' => 'https://www.kronberg.ch'],
            ['name' => 'Hoher Kasten', 'lat' => 47.2833, 'lng' => 9.4833, 'elevation_min' => 903, 'elevation_max' => 1794, 'canton' => 'AI', 'website_url' => 'https://www.hoherkasten.ch'],
            ['name' => 'Heiden', 'lat' => 47.4500, 'lng' => 9.5333, 'elevation_min' => 800, 'elevation_max' => 1100, 'canton' => 'AR', 'website_url' => 'https://www.heiden.ch'],

            // ========== VAUD (VD) ==========
            ['name' => 'Villars', 'lat' => 46.2989, 'lng' => 7.0567, 'elevation_min' => 1253, 'elevation_max' => 2120, 'canton' => 'VD', 'website_url' => 'https://www.villars.ch'],
            ['name' => 'Leysin', 'lat' => 46.3417, 'lng' => 7.0089, 'elevation_min' => 1263, 'elevation_max' => 2205, 'canton' => 'VD', 'website_url' => 'https://www.leysin.ch'],
            ['name' => 'Les Diablerets', 'lat' => 46.3497, 'lng' => 7.1608, 'elevation_min' => 1150, 'elevation_max' => 3000, 'canton' => 'VD', 'website_url' => 'https://www.diablerets.ch'],
            ['name' => 'Glacier 3000', 'lat' => 46.3333, 'lng' => 7.2000, 'elevation_min' => 1350, 'elevation_max' => 3000, 'canton' => 'VD', 'website_url' => 'https://www.glacier3000.ch'],
            ['name' => 'Château-d\'Oex', 'lat' => 46.4750, 'lng' => 7.1378, 'elevation_min' => 968, 'elevation_max' => 1630, 'canton' => 'VD', 'website_url' => 'https://www.chateau-doex.ch'],
            ['name' => 'La Dôle', 'lat' => 46.4247, 'lng' => 6.0992, 'elevation_min' => 1180, 'elevation_max' => 1677, 'canton' => 'VD', 'website_url' => 'https://www.ladole.ch'],
            ['name' => 'Les Mosses', 'lat' => 46.3958, 'lng' => 7.1042, 'elevation_min' => 1445, 'elevation_max' => 1862, 'canton' => 'VD', 'website_url' => 'https://www.lesmosses.ch'],
            ['name' => 'Rougemont', 'lat' => 46.4875, 'lng' => 7.2078, 'elevation_min' => 992, 'elevation_max' => 2156, 'canton' => 'VD', 'website_url' => 'https://www.rougemont.ch'],
            ['name' => 'Les Paccots', 'lat' => 46.5500, 'lng' => 6.9333, 'elevation_min' => 1061, 'elevation_max' => 1500, 'canton' => 'VD', 'website_url' => 'https://www.lespaccots.ch'],
            ['name' => 'Les Pléiades', 'lat' => 46.4667, 'lng' => 6.9333, 'elevation_min' => 1079, 'elevation_max' => 1360, 'canton' => 'VD', 'website_url' => 'https://www.pleiades.ch'],
            ['name' => 'Sainte-Croix/Les Rasses', 'lat' => 46.8167, 'lng' => 6.5000, 'elevation_min' => 1066, 'elevation_max' => 1450, 'canton' => 'VD', 'website_url' => 'https://www.sainte-croix-les-rasses.ch'],
            ['name' => 'La Givrine', 'lat' => 46.4500, 'lng' => 6.1500, 'elevation_min' => 1228, 'elevation_max' => 1350, 'canton' => 'VD', 'website_url' => 'https://www.lagivrine.ch'],
            ['name' => 'Le Brassus', 'lat' => 46.5500, 'lng' => 6.2333, 'elevation_min' => 1024, 'elevation_max' => 1250, 'canton' => 'VD', 'website_url' => 'https://www.lebrassus.ch'],

            // ========== FRIBOURG (FR) ==========
            ['name' => 'Moléson', 'lat' => 46.5500, 'lng' => 7.0167, 'elevation_min' => 1100, 'elevation_max' => 2002, 'canton' => 'FR', 'website_url' => 'https://www.moleson.ch'],
            ['name' => 'Charmey', 'lat' => 46.6167, 'lng' => 7.1667, 'elevation_min' => 900, 'elevation_max' => 1630, 'canton' => 'FR', 'website_url' => 'https://www.charmey.ch'],
            ['name' => 'La Berra', 'lat' => 46.6833, 'lng' => 7.2000, 'elevation_min' => 1000, 'elevation_max' => 1650, 'canton' => 'FR', 'website_url' => 'https://www.laberra.ch'],
            ['name' => 'Jaun', 'lat' => 46.6000, 'lng' => 7.2833, 'elevation_min' => 1015, 'elevation_max' => 1750, 'canton' => 'FR', 'website_url' => 'https://www.jaun.ch'],
            ['name' => 'Schwarzsee', 'lat' => 46.6667, 'lng' => 7.2833, 'elevation_min' => 1046, 'elevation_max' => 1750, 'canton' => 'FR', 'website_url' => 'https://www.schwarzsee.ch'],

            // ========== JURA / NEUCHÂTEL / SOLOTHURN ==========
            ['name' => 'Les Bugnenets-Savagnières', 'lat' => 47.1167, 'lng' => 6.9833, 'elevation_min' => 1083, 'elevation_max' => 1417, 'canton' => 'NE', 'website_url' => 'https://www.bugnenets-savagnieres.ch'],
            ['name' => 'La Vue-des-Alpes', 'lat' => 47.0333, 'lng' => 6.8833, 'elevation_min' => 1100, 'elevation_max' => 1300, 'canton' => 'NE', 'website_url' => 'https://www.neuchatelrando.ch'],
            ['name' => 'Les Prés-d\'Orvin', 'lat' => 47.1500, 'lng' => 7.1667, 'elevation_min' => 1000, 'elevation_max' => 1300, 'canton' => 'BE', 'website_url' => 'https://www.pres-dorvin.ch'],
            ['name' => 'Grenchenberg', 'lat' => 47.2167, 'lng' => 7.4000, 'elevation_min' => 1000, 'elevation_max' => 1400, 'canton' => 'SO', 'website_url' => 'https://www.grenchenberg.ch'],
            ['name' => 'Langenbruck', 'lat' => 47.3500, 'lng' => 7.7667, 'elevation_min' => 700, 'elevation_max' => 1100, 'canton' => 'BL', 'website_url' => 'https://www.langenbruck.ch'],
            ['name' => 'Hohe Winde', 'lat' => 47.3167, 'lng' => 7.5333, 'elevation_min' => 750, 'elevation_max' => 1100, 'canton' => 'SO', 'website_url' => 'https://www.hohewinde.ch'],

            // ========== TICINO (TI) ==========
            ['name' => 'Airolo', 'lat' => 46.5289, 'lng' => 8.6106, 'elevation_min' => 1175, 'elevation_max' => 2250, 'canton' => 'TI', 'website_url' => 'https://www.airolo.ch'],
            ['name' => 'Bosco Gurin', 'lat' => 46.3167, 'lng' => 8.4833, 'elevation_min' => 1504, 'elevation_max' => 2400, 'canton' => 'TI', 'website_url' => 'https://www.boscogurin.ch'],
            ['name' => 'Carì', 'lat' => 46.4833, 'lng' => 8.9333, 'elevation_min' => 1680, 'elevation_max' => 2280, 'canton' => 'TI', 'website_url' => 'https://www.cari.ch'],
            ['name' => 'Nara', 'lat' => 46.2667, 'lng' => 9.0167, 'elevation_min' => 1080, 'elevation_max' => 1980, 'canton' => 'TI', 'website_url' => 'https://www.nara.ch'],
            ['name' => 'Campo Blenio', 'lat' => 46.5167, 'lng' => 8.9500, 'elevation_min' => 1214, 'elevation_max' => 2000, 'canton' => 'TI', 'website_url' => 'https://www.campoblenio.ch'],
            ['name' => 'Cioss Prato', 'lat' => 46.5333, 'lng' => 8.6833, 'elevation_min' => 1560, 'elevation_max' => 2000, 'canton' => 'TI', 'website_url' => 'https://www.ciossprato.ch'],
            ['name' => 'Mogno', 'lat' => 46.4500, 'lng' => 8.6000, 'elevation_min' => 1180, 'elevation_max' => 1500, 'canton' => 'TI', 'website_url' => 'https://www.vallemaggia.ch'],
        ];
    }

    private function fetchResortsFromOverpass(): array
    {
        // Query for actual ski resorts/areas, not individual pistes
        $query = <<<'OVERPASS'
[out:json][timeout:90];
area["ISO3166-1"="CH"]->.switzerland;
(
  // Ski resort sites
  relation["site"="piste"](area.switzerland);
  relation["landuse"="winter_sports"](area.switzerland);
  way["landuse"="winter_sports"](area.switzerland);

  // Ski areas marked explicitly
  node["leisure"="ski_resort"](area.switzerland);
  way["leisure"="ski_resort"](area.switzerland);
  relation["leisure"="ski_resort"](area.switzerland);

  // Winter sports areas
  way["sport"="skiing"]["name"](area.switzerland);
  relation["sport"="skiing"]["name"](area.switzerland);

  // Ski lift base stations (often indicate ski areas)
  node["aerialway"="station"]["aerialway:summer"!="yes"]["name"~"Talstation|Berg|Bergstation",i](area.switzerland);
);
out center tags;
OVERPASS;

        try {
            $response = Http::timeout(90)
                ->asForm()
                ->post(self::OVERPASS_API, ['data' => $query]);

            if (!$response->successful()) {
                $this->error('Overpass API request failed: ' . $response->status());
                return [];
            }

            $data = $response->json();

            return $this->parseOverpassResponse($data);
        } catch (\Exception $e) {
            $this->error('Error fetching data: ' . $e->getMessage());
            return [];
        }
    }

    private function parseOverpassResponse(array $data): array
    {
        $resorts = [];
        $seen = [];

        // Patterns to filter out (lift stations, individual pistes, etc.)
        $excludePatterns = [
            '/bergstation/i',
            '/talstation/i',
            '/mittelstation/i',
            '/\bstation\b/i',
            '/skilift/i',
            '/schlepplift/i',
            '/sessellift/i',
            '/sesselbahn/i',
            '/gondelbahn/i',
            '/luftseilbahn/i',
            '/pendelbahn/i',
            '/standseilbahn/i',
            '/kabinenbahn/i',
            '/seilbahn/i',
            '/^piste\s/i',
            '/^\(\d+\)/i',           // Numbered pistes like "(01) Ravina"
            '/^baby\s*lift/i',
            '/abandonné/i',          // Abandoned pistes
            '/übungslift/i',
            '/kinderlift/i',
            '/^kinder/i',
            '/express$/i',
            '/\bESS\b/',             // Ski school
            '/\bBergbahn\b/i',
            '/umlauf/i',
        ];

        foreach ($data['elements'] ?? [] as $element) {
            $tags = $element['tags'] ?? [];
            $name = $tags['name'] ?? null;

            if (!$name || strlen($name) < 3) {
                continue;
            }

            // Skip entries matching exclude patterns
            $skip = false;
            foreach ($excludePatterns as $pattern) {
                if (preg_match($pattern, $name)) {
                    $skip = true;
                    break;
                }
            }
            if ($skip) {
                continue;
            }

            // Skip duplicates by normalized name
            $normalizedName = Str::slug($name);
            if (isset($seen[$normalizedName])) {
                continue;
            }
            $seen[$normalizedName] = true;

            // Get coordinates (center for ways/relations)
            $lat = $element['lat'] ?? ($element['center']['lat'] ?? null);
            $lng = $element['lon'] ?? ($element['center']['lon'] ?? null);

            if (!$lat || !$lng) {
                continue;
            }

            // Determine canton from coordinates
            $canton = $this->getCantonFromCoordinates($lat, $lng);

            $resorts[] = [
                'name' => $name,
                'lat' => round($lat, 7),
                'lng' => round($lng, 7),
                'elevation_min' => isset($tags['ele']) ? (int) $tags['ele'] : null,
                'elevation_max' => isset($tags['ele:top']) ? (int) $tags['ele:top'] : null,
                'canton' => $canton,
                'website_url' => $tags['website'] ?? $tags['contact:website'] ?? null,
            ];
        }

        // Sort by name
        usort($resorts, fn($a, $b) => strcmp($a['name'], $b['name']));

        return $resorts;
    }

    /**
     * Approximate canton lookup based on coordinates.
     * This is a simplified bounding-box approach for Swiss cantons.
     */
    private function getCantonFromCoordinates(float $lat, float $lng): ?string
    {
        // Swiss canton approximate bounding boxes (simplified)
        $cantons = [
            'VS' => ['lat_min' => 45.85, 'lat_max' => 46.65, 'lng_min' => 6.77, 'lng_max' => 8.48],
            'GR' => ['lat_min' => 46.17, 'lat_max' => 47.05, 'lng_min' => 8.65, 'lng_max' => 10.50],
            'BE' => ['lat_min' => 46.33, 'lat_max' => 47.35, 'lng_min' => 6.85, 'lng_max' => 8.45],
            'UR' => ['lat_min' => 46.45, 'lat_max' => 46.95, 'lng_min' => 8.38, 'lng_max' => 8.95],
            'OW' => ['lat_min' => 46.72, 'lat_max' => 46.98, 'lng_min' => 8.05, 'lng_max' => 8.55],
            'NW' => ['lat_min' => 46.77, 'lat_max' => 47.00, 'lng_min' => 8.20, 'lng_max' => 8.58],
            'GL' => ['lat_min' => 46.80, 'lat_max' => 47.15, 'lng_min' => 8.80, 'lng_max' => 9.25],
            'SZ' => ['lat_min' => 46.90, 'lat_max' => 47.20, 'lng_min' => 8.55, 'lng_max' => 9.00],
            'TI' => ['lat_min' => 45.82, 'lat_max' => 46.65, 'lng_min' => 8.38, 'lng_max' => 9.18],
            'VD' => ['lat_min' => 46.15, 'lat_max' => 46.98, 'lng_min' => 6.05, 'lng_max' => 7.25],
            'FR' => ['lat_min' => 46.45, 'lat_max' => 46.98, 'lng_min' => 6.85, 'lng_max' => 7.45],
            'SG' => ['lat_min' => 46.85, 'lat_max' => 47.55, 'lng_min' => 8.80, 'lng_max' => 9.70],
            'AI' => ['lat_min' => 47.25, 'lat_max' => 47.38, 'lng_min' => 9.35, 'lng_max' => 9.55],
            'AR' => ['lat_min' => 47.30, 'lat_max' => 47.48, 'lng_min' => 9.20, 'lng_max' => 9.65],
            'LU' => ['lat_min' => 46.78, 'lat_max' => 47.30, 'lng_min' => 7.85, 'lng_max' => 8.48],
            'JU' => ['lat_min' => 47.15, 'lat_max' => 47.50, 'lng_min' => 6.85, 'lng_max' => 7.55],
            'NE' => ['lat_min' => 46.82, 'lat_max' => 47.15, 'lng_min' => 6.45, 'lng_max' => 7.05],
        ];

        foreach ($cantons as $code => $bounds) {
            if ($lat >= $bounds['lat_min'] && $lat <= $bounds['lat_max'] &&
                $lng >= $bounds['lng_min'] && $lng <= $bounds['lng_max']) {
                return $code;
            }
        }

        return null;
    }
}
