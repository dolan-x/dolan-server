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

protectedRouter.use(jwt);

// Create post route
protectedRouter.post(`/posts`, posts.createPost);

// Update post route
protectedRouter.put(`/posts/:id`, posts.updatePost);

// Delete post route
protectedRouter.delete(`/posts/:id`, posts.deletePost);

// Create tag route
protectedRouter.post(`/tags`, tags.createTag);

// Update tag route
protectedRouter.put(`/tags/:id`, tags.updateTag);

// Delete tag route
protectedRouter.delete(`/tags/:id`, tags.deleteTag);

// Create category route
protectedRouter.post(`/categories`, categories.createCategory);

// Update category route
protectedRouter.put(`/categories/:id`, categories.updateCategory);

// Delete category route
protectedRouter.delete(`/categories/:id`, categories.deleteCategory);

// Create author route
protectedRouter.post(`/authors`, authors.createAuthor);

// Update author route
protectedRouter.put(`/authors/:id`, authors.updateAuthor);

// Delete author route
protectedRouter.delete(`/authors/:id`, authors.deleteAuthor);

// Update config route
protectedRouter.put(`/config/:name`, config.updateConfig);

// Update user route
protectedRouter.put(`/user`, user.updateUser);

export { protectedRouter };
