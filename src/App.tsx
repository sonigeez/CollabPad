import Spaces from "@ably/spaces";
import { SpaceProvider, SpacesProvider } from "@ably/spaces/react";
import LiveCursors from "./components/LiveCursors";

const App = ({ spaces }: { spaces: Spaces }) => (
  <SpacesProvider client={spaces}>
    <SpaceProvider name="live-cursors">
      <h1 className=" text-red-600 text-2xl bg-black text-right pt-2 pr-2  ">
        Powered by Ably realtime
      </h1>
      <LiveCursors />
    </SpaceProvider>
  </SpacesProvider>
);

export default App;
