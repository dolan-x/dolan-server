import { Router } from "../deps.ts";

import { API_VERSION } from "./lib/mod.ts";
import {
  authors,
  categories,
  config,
  posts,
  tags,
  user,
} from "./controller/mod.ts";
import { jwt } from "./middleware/mod.ts";

const protectedRouter = new Router({ prefix: `/${API_VERSION}` });

// Create post route
protectedRouter.post(`/posts`, jwt, posts.createPost);

// Update post route
protectedRouter.put(`/posts/:id`, jwt, posts.updatePost);

// Delete post route
protectedRouter.delete(`/posts/:id`, jwt, posts.deletePost);

// Create tag route
protectedRouter.post(`/tags`, jwt, tags.createTag);

// Update tag route
protectedRouter.put(`/tags/:id`, jwt, tags.updateTag);

// Delete tag route
protectedRouter.delete(`/tags/:id`, jwt, tags.deleteTag);

// Create category route
protectedRouter.post(`/categories`, jwt, categories.createCategory);

// Update category route
protectedRouter.put(`/categories/:id`, jwt, categories.updateCategory);

// Delete category route
protectedRouter.delete(`/categories/:id`, jwt, categories.deleteCategory);

// Create author route
protectedRouter.post(`/authors`, jwt, authors.createAuthor);

// Update author route
protectedRouter.put(`/authors/:id`, jwt, authors.updateAuthor);

// Delete author route
protectedRouter.delete(`/authors/:id`, jwt, authors.deleteAuthor);

// Update config route
protectedRouter.put(`/config/:name`, jwt, config.updateConfig);

// Update user route
protectedRouter.put(`/user`, jwt, user.updateUser);

export { protectedRouter };
