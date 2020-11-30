/**
 * @flow
 */

import * as RNIap from 'react-native-iap';
import { Cache } from 'react-native-cache';
import { AsyncStorage } from 'react-native';

const billingCache = new Cache({
  namespace: "billing",
  policy: {
    maxEntries: 1
  },
  backend: AsyncStorage
});

class BillingService {
  AD_REMOVAL_PRODUCT_ID = 'remove_ads';
  PRODUCT_IDS = [this.AD_REMOVAL_PRODUCT_ID];

  async didPurchaseAdRemoval(): boolean {
    console.log('didPurchaseAdRemoval');
    // TODO check if internet connection is working (maybe only if an exception is thrown)
    let didPurchase = await this.getCachedPurchase(this.AD_REMOVAL_PRODUCT_ID);
    if (didPurchase != null) {
      return didPurchase;
    }
    try {
      const products = await RNIap.getProducts(this.PRODUCT_IDS);
      didPurchase = products.length > 0;
      await this.cachePurchase(this.AD_REMOVAL_PRODUCT_ID, didPurchase);
    } catch (error) {
      return false;
    }
    if (didPurchase == null) {
      didPurchase = false;
    }
    return didPurchase;
  }

  async restoreAdRemovalPurchase() {
    const didPurchase = await this.didPurchaseAdRemoval();
    if (didPurchase) {
      await this.cachePurchase(this.AD_REMOVAL_PRODUCT_ID, didPurchase);
    }
    return didPurchase;
  }

  async purchaseAdRemoval(): boolean {
    if (!this.didPurchaseAdRemoval()) {
      const purchase = await RNIap.buyProduct(this.AD_REMOVAL_PRODUCT_ID);
      if (purchase.productId === this.AD_REMOVAL_PRODUCT_ID) {
        await this.cachePurchase(this.AD_REMOVAL_PRODUCT_ID, true);
        return true;
      } else {
        return false;
      }
    } else {
      console.log('Item has already been purchased');
      await this.cachePurchase(this.AD_REMOVAL_PRODUCT_ID, true);
      return false;
    }
  }

  async getCachedPurchase(product: string): boolean {
    return new Promise(function(resolve, reject) {
      billingCache.getItem(product, function(err, value) {
        if (err) {
          reject(err);
        } else if (value){
          console.log('Search cache hit for key', product);
          resolve(value === 'true');
        } else {
          resolve(null);
        }
      });
    });
  }

  async cachePurchase(product: string, didPurchase: boolean): void {
    return new Promise(function(resolve, reject) {
        billingCache.setItem(product, didPurchase.toString(), function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
  }

}

const billingService = new BillingService();
export default billingService;