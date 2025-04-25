
export interface DashboardSubscription {
  is_pro: boolean;
  category: string;
  phone_number: string;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
}
