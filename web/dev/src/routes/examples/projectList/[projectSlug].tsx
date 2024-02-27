import { useParams } from "solid-start";

export default function UserPage() {
	const params = useParams();
	return <div>{params["projectSlug"]}</div>;
}
