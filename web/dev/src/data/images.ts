interface ImageOptions {
	w: number;
	q: number;
}

interface ImageData {
	src: string;
	naturalWidth: number;
	naturalHeight: number;
	attribution?: {
		href: string;
		label: string;
	};
}

export const images: ImageData[] = [
	{
		src: "https://images.unsplash.com/photo-1620005446924-b31462716675?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop",
		naturalWidth: 565,
		naturalHeight: 848,
		attribution: {
			href: "https://unsplash.com/@egorghetto",
			label: "Eduardo Gorghetto",
		},
	},
	{
		src: "https://images.unsplash.com/photo-1666985138055-848cb1c7256c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop",
		naturalWidth: 678,
		naturalHeight: 847,
		attribution: {
			href: "https://unsplash.com/@leemckenzieluis",
			label: "Lee Luis",
		},
	},
	{
		src: "https://images.unsplash.com/photo-1622718831336-d6c854e91ccd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop",
		naturalWidth: 824,
		naturalHeight: 549,
		attribution: {
			href: "https://unsplash.com/@visuallert",
			label: "Jonas Allert",
		},
	},
	{
		src: "https://images.unsplash.com/photo-1610072163764-93cab353a095?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop",
		naturalWidth: 565,
		naturalHeight: 848,
		attribution: {
			href: "https://unsplash.com/@timmossholder",
			label: "Tim Mossholder",
		},
	},
	{
		src: "https://images.unsplash.com/photo-1540485104458-f27cfe2375b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop",
		naturalWidth: 678,
		naturalHeight: 848,
		attribution: {
			href: "https://unsplash.com/@kevinangelsoe",
			label: "Kevin Angelsø",
		},
	},
	{
		src: "https://images.unsplash.com/photo-1589998867530-166d924be02a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop",
		naturalWidth: 565,
		naturalHeight: 848,
		attribution: {
			href: "https://unsplash.com/@matreding",
			label: "Mathias Reding",
		},
	},
];

export function imageOptions(src: string, options: Partial<ImageOptions> = {}) {
	const url = new URL(src);

	for (const key in options) {
		url.searchParams.set(key, String(options[key as keyof ImageOptions]));
	}

	return url.href;
}
