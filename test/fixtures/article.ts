import { Group }   from '../../cjs/property-group'
import { groupOf } from '../../cjs/property-group'

@Group('sales', 'sellingPrice')
@Group('sales', 'sellingPrice', 'salesUnit')
@Group('purchases', 'purchasePrice')
export class Article
{

	@Group('logistics')
	weight = 0

	purchasePrice = 0
	salesUnit = ''
	sellingPrice = 0

	constructor(@Group('logistics') public volume = 0, @Group('purchases') readonly supplier = '')
	{
	}

}

@Group('sales', 'weight')
export class SpecialArticle extends Article
{
}

// These expressions also verify both accessor return types.
const groups: Record<string, Array<keyof Article>> = groupOf(Article)
const group: string | undefined = groupOf(Article, 'weight')
void groups
void group

// @ts-expect-error Class property lists must contain actual property names.
Group<Article>('sales', 'missing')
// @ts-expect-error Property access must use an actual property name.
groupOf(Article, 'missing')
