[![npm version](https://img.shields.io/npm/v/@itrocks/property-group?logo=npm)](https://www.npmjs.org/package/@itrocks/property-group)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/property-group)](https://www.npmjs.org/package/@itrocks/property-group)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/property-group?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/property-group)
[![issues](https://img.shields.io/github/issues/itrocks-ts/property-group)](https://github.com/itrocks-ts/property-group/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# property-group

Group class properties by business topic with a shared class and property decorator.

## Installation

Requires Node.js 24 or later and TypeScript with `experimentalDecorators` enabled.

```sh
npm i @itrocks/property-group
```

Constructor parameter properties use
[`@itrocks/decorator`](https://github.com/itrocks-ts/decorator)'s parameter name resolution.
Compile with `declaration: true` and keep the generated `.d.ts` files beside the compiled `.js` files.

## Usage

```ts
import { Group, groupOf } from '@itrocks/property-group'

@Group('sales', 'sellingPrice', 'salesUnit')
@Group('purchases', 'purchasePrice')
class Article
{

	purchasePrice = 0
	salesUnit = ''
	sellingPrice = 0

	@Group('logistics')
	weight = 0

	constructor(@Group('purchases') public supplier = '')
	{
	}

}

groupOf(Article)
// {
//   logistics: ['weight'],
//   purchases: ['supplier', 'purchasePrice'],
//   sales: ['sellingPrice', 'salesUnit']
// }

groupOf(Article, 'weight') // 'logistics'
groupOf(new Article(), 'supplier') // 'purchases'
```

Both forms write class-level group lists and property-level membership.
Grouping describes business metadata; it does not render or reorder a user interface itself.

## Public API

### `Group<T>(name: string, ...properties: Array<keyof T>)`

On a class, declares a named group containing the supplied properties.
Repeated declarations of the same group append properties without duplicates.
Omitting the property list declares an empty group.

On a property, use `@Group(name)` to add that property to the named group.
This also supports `public`, `protected`, `private` and `readonly` constructor parameter properties.
The group name is required; there is no implicit group and `false` is not accepted.

A property belongs to one group. If another declaration assigns it to a different group,
the last decorator executed wins and removes the property from its previous group.
Empty groups are retained. Within a declaration, property order is preserved;
across declarations, additions follow decorator execution order. Stacked class decorators execute bottom to top.

Subclasses inherit group metadata. Decorating a subclass copies the current inherited groups before applying changes,
so its declarations do not modify its parent or siblings.

### `groupOf<T>(target: ObjectOrType<T>): PropertyGroups<T>`

Returns a record mapping group names to property arrays for a class or instance.
An undecorated class returns `{}`. The returned record and arrays are copies.

### `groupOf<T>(target: ObjectOrType<T>, property: keyof T): string | undefined`

Returns the property's group name, including inherited membership, or `undefined` when it has no group.

### `PropertyGroups<T>`

The group record type: `Record<string, Array<keyof T>>`.

## Development

```sh
npm test
npm pack --dry-run
```

Tests compile real decorator examples, including constructor parameter properties, before running them.
