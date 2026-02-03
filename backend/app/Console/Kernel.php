<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Sync SLF bulletins every 30 minutes
        $schedule->command('slf:sync-bulletins')
            ->everyThirtyMinutes()
            ->withoutOverlapping()
            ->runInBackground();

        // Sync weather data every 30 minutes
        $schedule->command('weather:sync')
            ->everyThirtyMinutes()
            ->withoutOverlapping()
            ->runInBackground();

        // Send daily reminders (check every minute for scheduled times)
        $schedule->command('alerts:send-reminders')
            ->everyMinute()
            ->withoutOverlapping();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
