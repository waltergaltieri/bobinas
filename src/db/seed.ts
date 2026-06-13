import "dotenv/config";

import { getDb } from "@/db";
import {
  attributeOptions,
  attributes,
  categories,
  homeSlides,
  productAttributeValues,
  productImages,
  products,
  profiles,
  popupSettings,
  purchaseRequestItems,
  purchaseRequests,
  siteSettings,
} from "@/db/schema";
import {
  sampleAttributeOptions,
  sampleAttributes,
  sampleBuyerProfile,
  sampleCategories,
  sampleHomeSlides,
  samplePopupSettings,
  sampleProductAttributeValues,
  sampleProducts,
  samplePurchaseRequests,
  sampleSiteSettings,
} from "@/lib/data/sample-data";

async function main() {
  const db = getDb();

  await db
    .insert(categories)
    .values(
      sampleCategories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
        imagePublicId: category.imagePublicId,
        sortOrder: category.sortOrder,
        isFeatured: category.isFeatured,
        isActive: category.isActive,
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(attributes)
    .values(
      sampleAttributes.map((attribute) => ({
        id: attribute.id,
        name: attribute.name,
        slug: attribute.slug,
        type: attribute.type,
        unit: attribute.unit,
        isFilterable: attribute.isFilterable,
        isVisible: attribute.isVisible,
        sortOrder: attribute.sortOrder,
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(attributeOptions)
    .values(
      sampleAttributeOptions.map((option) => ({
        id: option.id,
        attributeId: option.attributeId,
        value: option.value,
        sortOrder: option.sortOrder,
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(products)
    .values(
      sampleProducts.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        description: product.description,
        internalCode: product.internalCode,
        oemCode: product.oemCode,
        brand: product.brand,
        model: product.model,
        price: product.price ?? "0.00",
        stockMode: product.stockMode,
        mainCategoryId: product.mainCategoryId,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(profiles)
    .values({
      id: sampleBuyerProfile.id,
      authUserId: sampleBuyerProfile.authUserId,
      role: sampleBuyerProfile.role,
      name: sampleBuyerProfile.name,
      companyName: sampleBuyerProfile.companyName,
      email: sampleBuyerProfile.email,
      phone: sampleBuyerProfile.phone,
      isActive: true,
    })
    .onConflictDoNothing();

  await db
    .insert(productAttributeValues)
    .values(
      sampleProductAttributeValues.map((value) => ({
        productId: value.productId,
        attributeId: value.attributeId,
        valueText: value.valueText,
        valueNumber: value.valueNumber,
        valueBoolean: value.valueBoolean,
        optionId: value.optionId,
      })),
    )
    .onConflictDoNothing();

  const images = sampleProducts.flatMap((product) =>
    product.images.map((image) => ({
      productId: product.id,
      url: image.url,
      publicId: image.publicId,
      altText: image.altText,
      sortOrder: image.sortOrder,
    })),
  );

  if (images.length > 0) {
    await db.insert(productImages).values(images).onConflictDoNothing();
  }

  await db
    .insert(purchaseRequests)
    .values(
      samplePurchaseRequests.map((request) => ({
        id: request.id,
        buyerId: request.buyerId,
        status: request.status,
        estimatedTotal: request.estimatedTotal,
        buyerNotes: request.buyerNotes,
        adminNotes: request.adminNotes,
        saleResult: request.saleResult,
        saleResultNotes: request.saleResultNotes,
        completedAt: request.completedAt,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(purchaseRequestItems)
    .values(
      samplePurchaseRequests.flatMap((request) =>
        request.items.map((item) => ({
          purchaseRequestId: request.id,
          productId: item.productId,
          productNameSnapshot: item.productNameSnapshot,
          productCodeSnapshot: item.productCodeSnapshot,
          unitPriceSnapshot: item.unitPriceSnapshot,
          quantity: item.quantity,
          subtotalSnapshot: item.subtotalSnapshot,
        })),
      ),
    )
    .onConflictDoNothing();

  await db
    .insert(siteSettings)
    .values({
      id: sampleSiteSettings.id,
      businessName: sampleSiteSettings.businessName,
      logoUrl: sampleSiteSettings.logoUrl,
      logoPublicId: sampleSiteSettings.logoPublicId,
      whatsapp: sampleSiteSettings.whatsapp,
      email: sampleSiteSettings.email,
      phone: sampleSiteSettings.phone,
      address: sampleSiteSettings.address,
      businessHours: sampleSiteSettings.businessHours,
      instagramUrl: sampleSiteSettings.instagramUrl,
      facebookUrl: sampleSiteSettings.facebookUrl,
      institutionalText: sampleSiteSettings.institutionalText,
      footerText: sampleSiteSettings.footerText,
      seoTitle: sampleSiteSettings.seoTitle,
      seoDescription: sampleSiteSettings.seoDescription,
      isActive: sampleSiteSettings.isActive,
    })
    .onConflictDoNothing();

  await db
    .insert(homeSlides)
    .values(
      sampleHomeSlides.map((slide) => ({
        id: slide.id,
        imageUrl: slide.imageUrl,
        imagePublicId: slide.imagePublicId,
        title: slide.title,
        subtitle: slide.subtitle,
        buttonText: slide.buttonText,
        buttonLink: slide.buttonLink,
        sortOrder: slide.sortOrder,
        isActive: slide.isActive,
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(popupSettings)
    .values({
      id: samplePopupSettings.id,
      isActive: samplePopupSettings.isActive,
      imageUrl: samplePopupSettings.imageUrl,
      imagePublicId: samplePopupSettings.imagePublicId,
      title: samplePopupSettings.title,
      text: samplePopupSettings.text,
      buttonText: samplePopupSettings.buttonText,
      buttonLink: samplePopupSettings.buttonLink,
      showOnce: samplePopupSettings.showOnce,
      startsAt: samplePopupSettings.startsAt,
      endsAt: samplePopupSettings.endsAt,
    })
    .onConflictDoNothing();

  console.log("Seed data inserted.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
