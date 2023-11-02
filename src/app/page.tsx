import Newmap from "../components/shared/map";
import NavBar from "../components/shared/navbar";

export default function Home() {
  return (
    <div style={{ overflow: "hidden" }}>
      <NavBar />
      <Newmap />
    </div>
  );
}
