import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStockRequirement,
  calculatePackagingRequirement,
  formatRupiah,
} from './calculations';

test('Smart Stock Calculator - matches exact prompt example', () => {
  const result = calculateStockRequirement({
    currentStock: 10,
    avgDailySales: 5,
    planningPeriodDays: 7,
    safetyStock: 3,
    purchasePrice: 3000,
  });

  assert.equal(result.targetStock, 38);
  assert.equal(result.recommendedPurchase, 28);
  assert.equal(result.estimatedCapital, 84000);
  assert.equal(result.status, 'pantau');
});

test('Smart Stock Calculator - recommends zero purchase when stock is sufficient', () => {
  const result = calculateStockRequirement({
    currentStock: 50,
    avgDailySales: 5,
    planningPeriodDays: 7,
    safetyStock: 3,
    purchasePrice: 3000,
  });

  assert.equal(result.targetStock, 38);
  assert.equal(result.recommendedPurchase, 0);
  assert.equal(result.estimatedCapital, 0);
  assert.equal(result.status, 'aman');
});

test('Smart Stock Calculator - marks as kulakan when current stock <= safety stock', () => {
  const result = calculateStockRequirement({
    currentStock: 2,
    avgDailySales: 4,
    planningPeriodDays: 5,
    safetyStock: 3,
    purchasePrice: 5000,
  });

  assert.equal(result.targetStock, 23);
  assert.equal(result.recommendedPurchase, 21);
  assert.equal(result.estimatedCapital, 105000);
  assert.equal(result.status, 'kulakan');
});

test('Packaging Calculator - matches exact prompt example', () => {
  const result = calculatePackagingRequirement({
    toyCount: 100,
    toysPerPackage: 2,
    pricePerBag: 100,
    availableBags: 10,
  });

  assert.equal(result.requiredPackaging, 50);
  assert.equal(result.additionalBags, 40);
  assert.equal(result.estimatedCost, 4000);
});

test('Packaging Calculator - handles odd counts with CEILING math', () => {
  const result = calculatePackagingRequirement({
    toyCount: 25,
    toysPerPackage: 4,
    pricePerBag: 150,
    availableBags: 0,
  });

  // CEILING(25 / 4) = 7 packages
  assert.equal(result.requiredPackaging, 7);
  assert.equal(result.additionalBags, 7);
  assert.equal(result.estimatedCost, 1050);
});

test('Packaging Calculator - zero cost when available bags exceed requirement', () => {
  const result = calculatePackagingRequirement({
    toyCount: 30,
    toysPerPackage: 3,
    pricePerBag: 200,
    availableBags: 20,
  });

  assert.equal(result.requiredPackaging, 10);
  assert.equal(result.additionalBags, 0);
  assert.equal(result.estimatedCost, 0);
});

test('formatRupiah formats IDR currency correctly', () => {
  const formatted = formatRupiah(84000);
  assert.ok(formatted.includes('84.000') || formatted.includes('84,000'));
  assert.ok(formatted.includes('Rp'));
});
