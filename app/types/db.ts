export interface CouponTemplate {
  id: bigint;
  name: string;
  type: 'CASH_VOUCHER' | 'PERCENTAGE_DISCOUNT' | 'FREE_ITEM';
  value: {
    amount?: number;
    percentage?: number;
    max_off?: number;
    item_id?: string;
    item_name?: string;
  };
  usage_rules: Array<{
    rule_type: 'MINIMUM_SPEND' | 'ITEM_ELIGIBILITY' | 'GIFT_CONDITION';
    params: {
      amount?: number;
      items?: Array<{ id: string; name: string }>;
      categories?: Array<{ id: string; name: string }>;
      required_items?: Array<{ id: string; name: string }>;
      required_categories?: Array<{ id: string; name: string }>;
      min_spend?: number;
    };
  }>;
  total_quantity: number;
  issued_quantity: number;
  per_user_limit: number;
  issue_start_time: Date | null;
  issue_end_time: Date | null;
  validity_type: string;
  valid_days_after_issue: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserCoupon {
  id: bigint;
  user_id: bigint;
  template_id: bigint;
  status: string;
  acquired_at: Date;
  expires_at: Date;
  used_at: Date | null;
  used_order_id: bigint | null;
  created_at: Date;
  updated_at: Date;
  coupon_templates: CouponTemplate;
} 