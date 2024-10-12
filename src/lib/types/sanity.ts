export interface Link {
	name: string
	url: string
}

export interface Section {
	title: string
	links: Link[]
}

export interface Footer {
	sections: Section[]
}

export interface Navbar {
	links: Link[]
}

export interface Layout {
	name: string
	logo: string // Assuming logo is a string, adjust as needed
	navbar: Navbar
	footer: Footer
}

export interface Image {
	asset: {
		_ref: string
	}
}

export interface Link {
	_key: string
	title: string
	url: string
}

export interface Hero {
	title: string
	subtitle: string
	description: string
	links: Link
}

export interface Feature {
	title: string
	description: string
	imageUrl: string
}

export interface FeaturesList {
	sectionTitle: string
	featureList: Feature[]
}

export interface PricingItem {
	title: string
	price: number
	link: string
	includedItems: string[]
	highlighted: boolean
	vat: boolean
}

export interface PricingList {
	sectionTitle: string
	pricingList: PricingItem[]
}

export interface Contact {
	sectionTitle: string
	email: string
	name: string
	message: string
}

export interface LandingPage {
	hero: Hero
	features: FeaturesList
	pricing: PricingList
	contact: Contact
}
