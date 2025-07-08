import { prisma } from "@/app/lib/prisma";
import { UserCoupon } from "../types/db";

export async function getAllCouponUsers() {
  const allUserCoupons = await prisma.user_coupons.findMany({
    include: {
      coupon_templates: true,
    },
  });

  return allUserCoupons.map((userCoupon) => ({
    ...userCoupon,
  }));
}
