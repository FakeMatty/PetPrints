import { NextResponse } from "next/server";
import { storefront, CART_CREATE } from "@/lib/shopify";

type Attribute = { key: string; value: string };

type CartCreateResult = {
  cartCreate: {
    cart: { id: string; checkoutUrl: string; totalQuantity: number } | null;
    userErrors: { field: string[] | null; message: string }[];
  };
};

// POST /api/cart
// Body: { merchandiseId, quantity?, attributes? }
// Creates a Shopify cart with the artwork attached as line-item properties,
// and returns the hosted checkout URL to redirect the customer to.
export async function POST(request: Request) {
  try {
    const { merchandiseId, quantity = 1, attributes = [] } = (await request.json()) as {
      merchandiseId?: string;
      quantity?: number;
      attributes?: Attribute[];
    };

    if (!merchandiseId) {
      return NextResponse.json({ error: "merchandiseId is required" }, { status: 400 });
    }

    const data = await storefront<CartCreateResult>(CART_CREATE, {
      lines: [{ merchandiseId, quantity, attributes }],
    });

    const { cart, userErrors } = data.cartCreate;
    if (userErrors?.length) {
      return NextResponse.json({ error: userErrors.map((e) => e.message).join("; ") }, { status: 400 });
    }
    if (!cart) {
      return NextResponse.json({ error: "Cart was not created" }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl: cart.checkoutUrl, cartId: cart.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
