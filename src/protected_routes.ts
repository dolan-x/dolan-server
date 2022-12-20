import { Router } from "oak";

import {
  authors,
  categories,
  config,
  init,
  injections,
  pages,
  posts,
  tags,
  users,
} from "./controller/mod.ts";
import { jwt } from "./middleware/mod.ts";

const protectedRouter = new Router();

protectedRouter.use(jwt);

// Create post
protectedRouter.post(`/posts`, posts.createPost);

// Update post
protectedRouter.put(`/posts/:slug`, posts.updatePost);

// Delete post
protectedRouter.delete(`/posts/:slug`, posts.deletePost);

// Create tag
protectedRouter.post(`/tags`, tags.createTag);

// Update tag
protectedRouter.put(`/tags/:slug`, tags.updateTag);

// Delete tag
protectedRouter.delete(`/tags/:slug`, tags.deleteTag);

// Create category
protectedRouter.post(`/categories`, categories.createCategory);

// Update category
protectedRouter.put(`/categories/:slug`, categories.updateCategory);

// Delete category
protectedRouter.delete(`/categories/:slug`, categories.deleteCategory);

// Create author
protectedRouter.post(`/authors`, authors.createAuthor);

// Update author
protectedRouter.put(`/authors/:slug`, authors.updateAuthor);

// Delete author
protectedRouter.delete(`/authors/:slug`, authors.deleteAuthor);

// Create page
protectedRouter.post(`/pages`, pages.createPage);

// Update page
protectedRouter.put(`/pages/:slug`, pages.updatePage);

// Delete page
protectedRouter.delete(`/pages/:slug`, pages.deletePage);

// Update config
protectedRouter.put(`/config/:name`, config.updateConfig);

// Update user
protectedRouter.put(`/users`, users.updateUser);

// Init
protectedRouter.post(`/init`, init.init);

// Create injection
protectedRouter.post(`/injections`, injections.createInjection);

// Update injection
protectedRouter.put(`/injections/:name`, injections.updateInjection);

// Delete injection
protectedRouter.delete(`/injections/:name`, injections.deleteInjection);

export { protectedRouter };
