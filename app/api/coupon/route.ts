import { NextResponse } from "next/server";
import { getAllCouponUsers } from "@/app/db/CouponUsersDb";
import { UserCoupon } from "@/app/types/db";
import { Coupon } from "@/app/types";


export async function GET() {
  try {
    console.log("Fetching user coupons...");
    const userCoupons = await getAllCouponUsers();
    console.log("Raw user coupons:", userCoupons);

    return NextResponse.json(
      {
        coupons: userCoupons,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}
