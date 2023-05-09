import { inject, h } from "vue";

function useLink(props) {
  const router = inject("router");
  function navigate() {
    router.push(props.to);
  }
  return { navigate };
}

export const RouterLink = {
  name: "RouterLink",
  props: {
    to: {
      type: [String, Object],
      required: true,
    },
  },
  setup(props, { slots }) {
    const link = useLink(props); // 修改 router 中 history
    return () => {
      return h(
        // 虚拟节点 -》 真实节点
        "a",
        {
          onClick: link.navigate,
        },
        slots.default && slots.default()
      );
    };
  },
};
