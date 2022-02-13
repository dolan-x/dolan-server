import { Router } from "../deps.ts";

import { API_VERSION } from "./lib/mod.ts";
import {
  authors,
  categories,
  config,
  pages,
  posts,
  tags,
  users,
} from "./controller/mod.ts";
import { getUserInfo } from "./middleware/mod.ts";

const unprotectedRouter = new Router({ prefix: `/${API_VERSION}` });

unprotectedRouter.use(getUserInfo);

// Post list route
unprotectedRouter.get(`/posts`, posts.getPosts);

// Post detail route
unprotectedRouter.get(`/posts/:id`, posts.getPost);

// Tags route
unprotectedRouter.get("/tags", tags.getTags);

// Tag count route
unprotectedRouter.get("/tags/:id/count", tags.getTagCount);

// Tag detail route
unprotectedRouter.get("/tags/:id", tags.getTag);

// Categories route
unprotectedRouter.get("/categories", categories.getCategories);

// Category count route
unprotectedRouter.get("/categories/:id/count", categories.getCategoryCount);

// Category detail route
unprotectedRouter.get("/categories/:id", categories.getCategory);

// Authors route
unprotectedRouter.get("/authors", authors.getAuthors);

// Author posts route
unprotectedRouter.get("/authors/:id/posts", authors.getAuthorPosts);

// Author detail route
unprotectedRouter.get("/authors/:id", authors.getAuthor);

// Page list route
unprotectedRouter.get(`/pages`, pages.getPages);

// Post detail route
unprotectedRouter.get(`/pages/:id`, pages.getPage);

// Config detail route
unprotectedRouter.get("/config/:name", config.getConfig);

// User Info route
unprotectedRouter.get("/users/whoAmI", users.getUserInfo);

// Login route
unprotectedRouter.post("/users/login", users.loginUser);

// Register route
unprotectedRouter.post("/users/signup", users.signupUser);

export { unprotectedRouter };
