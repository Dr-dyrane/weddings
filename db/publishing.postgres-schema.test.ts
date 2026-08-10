import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import {
  authoringMediaAssets,
  authoringPeople,
  authoringStoryMilestones,
  authoringVendors,
  authoringWeddingEvents,
  authoringWeddings,
  publishedWeddingRevisions,
} from "./publishing.postgres-schema";

describe("PostgreSQL publishing schema", () => {
  it("keeps authoring entities relational and wedding scoped", () => {
    const childTables = [
      authoringWeddingEvents,
      authoringStoryMilestones,
      authoringPeople,
      authoringVendors,
      authoringMediaAssets,
    ];

    for (const table of childTables) {
      const config = getTableConfig(table);
      const primaryKeyColumns = config.primaryKeys.flatMap((key) =>
        key.columns.map((column) => column.name),
      );

      expect(primaryKeyColumns).toEqual(
        expect.arrayContaining(["tenant_id", "wedding_id", "id"]),
      );
      expect(config.foreignKeys).toHaveLength(1);
    }

    expect(getTableName(authoringWeddings)).toBe("authoring_weddings");
  });

  it("addresses append-only snapshots by tenant, wedding, and revision", () => {
    const config = getTableConfig(publishedWeddingRevisions);

    expect(
      config.primaryKeys.flatMap((key) =>
        key.columns.map((column) => column.name),
      ),
    ).toEqual(["tenant_id", "wedding_id", "revision"]);
    expect(config.indexes.map((index) => index.config.name)).toEqual(
      expect.arrayContaining([
        "published_wedding_source_revision_unique",
        "published_wedding_share_card_edition_unique",
      ]),
    );
  });

  it("persists the compiler-facing published asset identity for media", () => {
    const columnNames = getTableConfig(authoringMediaAssets).columns.map(
      (column) => column.name,
    );

    expect(columnNames).toContain("published_asset");
  });
});
