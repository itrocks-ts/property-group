import { ObjectOrType }                     from '@itrocks/class-type'
import { Type }                             from '@itrocks/class-type'
import { typeOf }                           from '@itrocks/class-type'
import { decorate as decorateClass }        from '@itrocks/decorator/class'
import { decoratorOf as classDecorator }    from '@itrocks/decorator/class'
import { decorate as decorateProperty }     from '@itrocks/decorator/property'
import { decoratorOf as propertyDecorator } from '@itrocks/decorator/property'
import { parameterProperty }                from '@itrocks/decorator/property'

export type PropertyGroups<T extends object> = Record<string, Array<keyof T>>

const GROUP = Symbol('group')

export function Group<T extends object>(name: string, ...properties: Array<keyof T>)
{
	return (target: ObjectOrType<T>, property?: Extract<keyof T, string | symbol>, index?: number): void => {
		let type: Type<T>
		let members = properties
		if ((property !== undefined) || (index !== undefined)) {
			const [prototype, propertyName] = parameterProperty(target, property, index)
			type    = prototype.constructor as Type<T>
			members = [propertyName]
		}
		else {
			type = typeOf(target)
		}
		const groups = groupOf(type)
		if (!Object.hasOwn(groups, name)) {
			Object.defineProperty(groups, name, { configurable: true, enumerable: true, value: [], writable: true })
		}
		for (const member of members) {
			for (const other of Object.keys(groups)) {
				if (other !== name) groups[other] = groups[other].filter(property => property !== member)
			}
			if (!groups[name].includes(member)) groups[name].push(member)
			decorateProperty<T>(GROUP, name)(type.prototype, member as Extract<keyof T, string | symbol>)
		}
		decorateClass<T>(GROUP, groups)(type)
	}
}

export function groupOf<T extends object>(target: ObjectOrType<T>): PropertyGroups<T>
export function groupOf<T extends object>(target: ObjectOrType<T>, property: keyof T): string | undefined
export function groupOf<T extends object>(target: ObjectOrType<T>, property?: keyof T)
	: PropertyGroups<T> | string | undefined
{
	if (property !== undefined) return propertyDecorator<string | undefined, T>(target, property, GROUP)
	const groups = classDecorator<PropertyGroups<T>>(target, GROUP, {})
	return Object.fromEntries(Object.entries(groups).map(([name, properties]) => [name, [...properties]]))
}
