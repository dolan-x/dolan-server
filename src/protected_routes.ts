import { Router } from "../deps.ts";

import { API_VERSION } from "./lib/mod.ts";
import {
  authors,
  categories,
  config,
  init,
  pages,
  posts,
  tags,
  users,
} from "./controller/mod.ts";
import { jwt } from "./middleware/mod.ts";

const protectedRouter = new Router({ prefix: `/${API_VERSION}` });

protectedRouter.use(jwt);

// Create post
protectedRouter.post(`/posts`, posts.createPost);

// Update post
protectedRouter.put(`/posts/:id`, posts.updatePost);

// Delete post
protectedRouter.delete(`/posts/:id`, posts.deletePost);

// Create tag
protectedRouter.post(`/tags`, tags.createTag);

// Update tag
protectedRouter.put(`/tags/:id`, tags.updateTag);

// Delete tag
protectedRouter.delete(`/tags/:id`, tags.deleteTag);

// Create category
protectedRouter.post(`/categories`, categories.createCategory);

// Update category
protectedRouter.put(`/categories/:id`, categories.updateCategory);

// Delete category
protectedRouter.delete(`/categories/:id`, categories.deleteCategory);

// Create author
protectedRouter.post(`/authors`, authors.createAuthor);

// Update author
protectedRouter.put(`/authors/:id`, authors.updateAuthor);

// Delete author
protectedRouter.delete(`/authors/:id`, authors.deleteAuthor);

// Create page
protectedRouter.post(`/pages`, pages.createPage);

// Update page
protectedRouter.put(`/pages/:id`, pages.updatePage);

// Delete page
protectedRouter.delete(`/pages/:id`, pages.deletePage);

// Update config
protectedRouter.put(`/config/:name`, config.updateConfig);

// Update user
protectedRouter.put(`/user`, users.updateUser);

// Init
protectedRouter.post(`/init`, init.init);

export { protectedRouter };
