import { useFetch, type UseFetchOptions } from "#app";
const usePost = async <T = any>(url: string, body: any = {}, headers: Record<string, string> = {}) => {
	const options: UseFetchOptions<T> = {
		headers: Object.assign(
			{
				"Content-Type": "application/json"
			},
			headers
		),
		body,
		method: "POST"
	};
	let { data, error, pending, status } = await useFetch(url, options);
	if (status.value == "success") {
	}

	return { data, error, loading: pending };
};

const useGet = async <T = any>(url: string, query: Record<string, string> = {}, headers: any = {}) => {
	const options: UseFetchOptions<T> = {
		headers: Object.assign(
			{
				"Content-Type": "application/json"
			},
			headers
		),
		query,
		method: "GET"
	};
	let { data, error, pending, status } = await useFetch(url, options);
	if (status.value == "success") {
	}

	return { data, error, loading: pending };
};
export { usePost, useGet };
