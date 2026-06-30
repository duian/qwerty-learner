CREATE TABLE `dictionaries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`language` text NOT NULL,
	`language_category` text NOT NULL,
	`tags` text NOT NULL,
	`word_count` integer NOT NULL,
	`user_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`word_id` integer NOT NULL,
	`dict_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`word_id`) REFERENCES `words`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_favorites_user_word` ON `favorites` (`user_id`,`word_id`);--> statement-breakpoint
CREATE TABLE `wordbook_words` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`wordbook_id` integer NOT NULL,
	`word_id` integer NOT NULL,
	`sort_order` integer NOT NULL,
	FOREIGN KEY (`wordbook_id`) REFERENCES `wordbooks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`word_id`) REFERENCES `words`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_wordbook_words` ON `wordbook_words` (`wordbook_id`,`word_id`);--> statement-breakpoint
CREATE TABLE `wordbooks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `words` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dict_id` text NOT NULL,
	`name` text NOT NULL,
	`trans` text NOT NULL,
	`usphone` text,
	`ukphone` text,
	`notation` text,
	`sort_order` integer NOT NULL,
	FOREIGN KEY (`dict_id`) REFERENCES `dictionaries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_words_dict_sort` ON `words` (`dict_id`,`sort_order`);