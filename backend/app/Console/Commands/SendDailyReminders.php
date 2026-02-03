<?php

namespace App\Console\Commands;

use App\Jobs\SendDailyReminder;
use App\Services\AlertRuleService;
use Illuminate\Console\Command;

class SendDailyReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'alerts:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send daily reminders for active alert rules at scheduled times';

    /**
     * Execute the console command.
     */
    public function handle(AlertRuleService $alertRuleService)
    {
        $rules = $alertRuleService->getDailyReminders();

        if ($rules->isEmpty()) {
            $this->info('No daily reminders scheduled for this time');
            return 0;
        }

        $this->info("Dispatching {$rules->count()} daily reminder(s)...");

        foreach ($rules as $rule) {
            SendDailyReminder::dispatch($rule);
        }

        $this->info('Daily reminders dispatched successfully');
        return 0;
    }
}
