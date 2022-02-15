import { Router } from "../deps.ts";

import { API_VERSION } from "./lib/mod.ts";
import {
  authors,
  categories,
  config,
  pages,
  posts,
  sitemap,
  tags,
  users,
} from "./controller/mod.ts";
import { getUserInfo } from "./middleware/mod.ts";

const unprotectedRouter = new Router({ prefix: `/${API_VERSION}` });

unprotectedRouter.use(getUserInfo);

// Post list
unprotectedRouter.get(`/posts`, posts.getPosts);

// Post detail
unprotectedRouter.get(`/posts/:id`, posts.getPost);

// Tags
unprotectedRouter.get("/tags", tags.getTags);

// Tag count
unprotectedRouter.get("/tags/:id/count", tags.getTagCount);

// Tag detail
unprotectedRouter.get("/tags/:id", tags.getTag);

// Categories
unprotectedRouter.get("/categories", categories.getCategories);

// Category count
unprotectedRouter.get("/categories/:id/count", categories.getCategoryCount);

// Category detail
unprotectedRouter.get("/categories/:id", categories.getCategory);

// Authors
unprotectedRouter.get("/authors", authors.getAuthors);

// Author posts
unprotectedRouter.get("/authors/:id/posts", authors.getAuthorPosts);

// Author detail
unprotectedRouter.get("/authors/:id", authors.getAuthor);

// Page list
unprotectedRouter.get(`/pages`, pages.getPages);

// Post detail
unprotectedRouter.get(`/pages/:id`, pages.getPage);

// Config detail
unprotectedRouter.get("/config/:name", config.getConfig);

// User Info
unprotectedRouter.get("/users/info", users.getUserInfo);

// Login
unprotectedRouter.post("/users/login", users.loginUser);

// Register
unprotectedRouter.post("/users/signup", users.signupUser);

// Sitemap
unprotectedRouter.get("/sitemap", sitemap.generateSitemap);

export { unprotectedRouter };
