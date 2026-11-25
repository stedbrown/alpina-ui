# Edition label comparison

The landing page builds both the rendered form and its copyable example from the same TSX file. Copy the Alpina example into a React app with Alpina installed. For the shadcn/ui example, install the New York Input and Button with the shadcn CLI. Both forms store their result in local React state.

The comparison runs in separate local documents so the two libraries keep their own styles. The shadcn fixture uses the [MIT-licensed New York components at 055aa6b](https://github.com/shadcn-ui/ui/tree/055aa6b7837b1808456a24beb4c97a677864aa82/apps/v4/registry/new-york-v4/ui). Its Input uses the original classes. Its Button specializes the registry to the native, default-size, default-variant branch used here. Tailwind compiles the rendered utility classes at build time using the neutral primary, input and ring colors. Both previews are rendered to HTML before the browser hydrates them.
