const assert = require('node:assert/strict')
const { test } = require('node:test')
const { Group, groupOf } = require('../cjs/property-group')
const { Article, SpecialArticle } = require('./cjs/article')

test('class decorators merge properties without duplicates and populate property metadata', () => {
	assert.deepEqual(groupOf(Article).sales, ['sellingPrice', 'salesUnit'])
	assert.equal(groupOf(Article, 'sellingPrice'), 'sales')
	assert.equal(groupOf(Article, 'salesUnit'), 'sales')
})

test('constructor parameter properties and fields populate both metadata views', () => {
	assert.deepEqual(groupOf(Article).logistics, ['weight', 'volume'])
	assert.deepEqual(groupOf(Article).purchases, ['supplier', 'purchasePrice'])
	assert.equal(groupOf(Article, 'volume'), 'logistics')
	assert.equal(groupOf(Article, 'supplier'), 'purchases')
	assert.equal(groupOf(Article, 'weight'), 'logistics')
})

test('empty groups and undecorated properties have defined defaults', () => {
	class Empty {}
	assert.deepEqual(groupOf(Empty), {})
	assert.equal(groupOf(Empty, 'missing'), undefined)
	Group('empty')(Empty)
	assert.deepEqual(groupOf(Empty), { empty: [] })
})

test('group names may coincide with object prototype names', () => {
	class Example {}
	Group('__proto__', 'first')(Example)
	Group('constructor', 'second')(Example)
	assert.deepEqual(Object.keys(groupOf(Example)), ['__proto__', 'constructor'])
	assert.deepEqual(groupOf(Example).__proto__, ['first'])
	assert.equal(groupOf(Example, 'second'), 'constructor')
})

test('inheritance and reassignment leave the parent metadata unchanged', () => {
	assert.deepEqual(groupOf(SpecialArticle).logistics, ['volume'])
	assert.deepEqual(groupOf(SpecialArticle).sales, ['sellingPrice', 'salesUnit', 'weight'])
	assert.equal(groupOf(SpecialArticle, 'weight'), 'sales')
	assert.equal(groupOf(SpecialArticle, 'volume'), 'logistics')
	assert.deepEqual(groupOf(Article).logistics, ['weight', 'volume'])
	assert.equal(groupOf(Article, 'weight'), 'logistics')
})

test('instances expose the same groups as their classes', () => {
	const article = new SpecialArticle()
	assert.deepEqual(groupOf(article), groupOf(SpecialArticle))
	assert.equal(groupOf(article, 'weight'), 'sales')
})

test('property reassignment updates both metadata views and preserves other properties', () => {
	class Example {}
	Group('first', 'one', 'two')(Example)
	Group('second')(Example.prototype, 'one')
	assert.deepEqual(groupOf(Example), { first: ['two'], second: ['one'] })
	assert.equal(groupOf(Example, 'one'), 'second')
	assert.equal(groupOf(Example, 'two'), 'first')
})

test('reading groups returns independent arrays and records', () => {
	const groups = groupOf(Article)
	groups.sales.push('weight')
	delete groups.logistics
	assert.deepEqual(groupOf(Article).sales, ['sellingPrice', 'salesUnit'])
	assert.deepEqual(groupOf(Article).logistics, ['weight', 'volume'])
})

test('symbol properties can be grouped from either target', () => {
	class Example {}
	const first = Symbol('first')
	const second = Symbol('second')
	Group('symbols', first)(Example)
	Group('symbols')(Example.prototype, second)
	assert.deepEqual(groupOf(Example), { symbols: [first, second] })
	assert.equal(groupOf(Example, first), 'symbols')
	assert.equal(groupOf(Example, second), 'symbols')
})
