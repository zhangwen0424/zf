import React from "react";
import NewsList from "./NewsList";
const RemoteSliders = React.lazy(() => import("hostXXX/Sliders"));
const App = () => {
  return (
    <div>
      <h2>本地组件NewsList</h2>
      <NewsList />
      <h2>远程组件Sliders</h2>
      <React.Suspense fallback={<div>加载远程组件中...</div>}>
        <RemoteSliders />
      </React.Suspense>
    </div>
  );
};
export default App;
