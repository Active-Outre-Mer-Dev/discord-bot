import { Client } from "@notionhq/client";
// import type {
//   TitlePropertyItemObjectResponse,
//   TableBlockObjectResponse,
//   TableRowBlockObjectResponse
// } from "@notionhq/client/build/src/api-endpoints";
import dotenv from "dotenv";
import { hyperlink } from "discord.js";

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_SECRET });
const categoriesDB = process.env.NOTION_CATEGORIES_ID!;

export class NotionError extends Error {
  constructor() {
    super();
  }
}

// type NotionResponse = {
//   results: CategoriesDB[];
// };

// type CategoriesDB = {
//   properties: {
//     Name: Title;
//   };
//   id: string;
// };

// type Title = Omit<TitlePropertyItemObjectResponse, "title"> & { title: { plain_text: string }[] };

export function getLinks() {
  const cache = new Map<string, { label: string; value: string }[]>();
  return async (label: string) => {
    try {
      if (cache.has(label)) {
        return cache.get(label).map(link => hyperlink(link.label, link.value));
      } else {
        const page = await notion.databases.query({
          database_id: categoriesDB,
          filter: { property: "Name", title: { equals: label } }
        });

        //Get the first entry in the database that matched the filter
        const category = page.results[0];
        const subPage = await notion.blocks.children.list({ block_id: category.id });

        //Get the first child of the page which is always going to be a table
        const table = subPage.results[0];
        //@ts-expect-error
        if (!table || !table.has_children) return [];

        const values = await notion.blocks.children.list({ block_id: table.id });
        //exclude first row since its the header for the table
        const rows = values.results.slice(1);

        const links = rows.map(row => {
          //@ts-expect-error
          const label = row.table_row.cells[0][0].plain_text;
          //@ts-expect-error
          const value = row.table_row.cells[1][0].plain_text;
          return { label, value };
        });
        cache.set(label, links);
        return links.map(link => hyperlink(link.label, link.value));
      }
    } catch (error) {
      throw new NotionError();
    }
  };
}
export async function getCategories(): Promise<{ name: string; value: string }[]> {
  const page = await notion.databases.query({
    database_id: categoriesDB,
    filter: { property: "Status", select: { equals: "Published" } }
  });

  return page.results
    .map(result => {
      //@ts-expect-error
      const name = result.properties.Name.title[0].plain_text;
      const value = name.trim().replace(/ /gi, "-").toLowerCase();
      return { name, value };
    })
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      } else {
        return 0;
      }
    });
}
