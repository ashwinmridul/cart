enum CouponType {
    APPLY_TO_ALL = 'APPLY_TO_ALL',
    APPLY_NEXT = 'APPLY_NEXT',
    APPLY_ON_INDEX = 'APPLY_ON_INDEX',
}

interface ProductIndicesByName {
    [productName: string]: number[];
}

class Product {
    name: string;
    price: number;
    
    constructor(name: string, price: number) {
        this.name = name;
        this.price = price;
    }

    applyDiscount(value: number, type: CouponType): number {
        let discount = 0;
        switch(type) {
            case CouponType.APPLY_TO_ALL:
            case CouponType.APPLY_NEXT:
                discount = this.price * value / 100;
                break;
            case CouponType.APPLY_ON_INDEX:
                discount = value;

        }
        this.price -= discount;
        // Pass 2
        return discount;
    }
}

class Coupon {
    type: CouponType;
    discount: number;
    productName?: string;
    active: boolean; // Pass 2
    productIndex?: number;
    
    constructor(type: CouponType, discount: number, productName?: string, productIndex?: number) {
        this.type = type;
        this.discount = discount;
        this.productName = productName;
        this.productIndex = productIndex;
        this.active = true; // Pass 2
    }

    // Pass 2
    deactivate() {
        this.active = false;
    }
}

class Cart {
    products: Product[]
    coupons: Coupon[]
    cartPrice: number;
    productIndicesByName: ProductIndicesByName; // Pass 3

    constructor() {
        this.products = [];
        this.coupons = [];
        this.cartPrice = 0;
        this.productIndicesByName = {}; // Pass 3
    }

    addProduct(product: Product): void {
        for (const coupon of this.coupons) {
            // Pass 2
            if (!coupon.active) continue;

            const isIndexMatching = coupon.productName && coupon.productIndex === (this.productIndicesByName[coupon.productName] || []).length;
            if (coupon.type === CouponType.APPLY_TO_ALL) product.applyDiscount(coupon.discount, coupon.type);
            else if (coupon.type === CouponType.APPLY_NEXT || (coupon.type === CouponType.APPLY_ON_INDEX && isIndexMatching)) {
                product.applyDiscount(coupon.discount, coupon.type);
                // Pass 2
                coupon.deactivate();
            }
        }
        this.products.push(product);

        // Pass 3
        if (!this.productIndicesByName[product.name]) this.productIndicesByName[product.name] = [];
        this.productIndicesByName[product.name].push(this.products.length - 1);

        this.cartPrice += product.price;
    }

    applyCoupon(coupon: Coupon): void {
        if (coupon.discount === undefined) return;
        if (coupon.type === CouponType.APPLY_ON_INDEX && (coupon.productName === undefined || coupon.productName === undefined)) return;
        
        let couponApplied = false;
        if (coupon.type === CouponType.APPLY_TO_ALL)
            for (let product of this.products) this.cartPrice -= product.applyDiscount(coupon.discount, coupon.type);
        else if (coupon.type === CouponType.APPLY_ON_INDEX && 
            coupon.productName && coupon.productIndex !== undefined && 
            coupon.productIndex < (this.productIndicesByName[coupon.productName] || []).length
        ) {
            this.cartPrice -= this.products[this.productIndicesByName[coupon.productName][coupon.productIndex]].applyDiscount(coupon.discount, coupon.type);
            couponApplied = true;
        }
        if (!couponApplied) this.coupons.push(coupon);
    }

    getCartPrice(): number {
        return this.cartPrice;
    }
}

let cart = new Cart();
cart.applyCoupon(new Coupon(CouponType.APPLY_NEXT, 10));
cart.addProduct(new Product("Business cards", 10));
cart.addProduct(new Product("T-shirt", 20));
console.log(cart.getCartPrice());

cart = new Cart();
cart.addProduct(new Product("Business cards", 10));
cart.applyCoupon(new Coupon(CouponType.APPLY_NEXT, 10));
cart.addProduct(new Product("T-shirt", 20));
console.log(cart.getCartPrice());

cart = new Cart();
cart.addProduct(new Product("Business cards", 10));
cart.applyCoupon(new Coupon(CouponType.APPLY_ON_INDEX, 2, "Business cards", 1));
cart.applyCoupon(new Coupon(CouponType.APPLY_TO_ALL, 25));
cart.applyCoupon(new Coupon(CouponType.APPLY_NEXT, 10));
cart.addProduct(new Product("Business cards", 10));
console.log(cart.getCartPrice());