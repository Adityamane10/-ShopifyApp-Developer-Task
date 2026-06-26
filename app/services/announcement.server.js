import { connectToDatabase } from "./mongodb.server";
import { getAnnouncementModel } from "../models/Announcement.server";

export async function saveAnnouncementAndSyncMetafield({
  announcement,
  admin,
}) {
  await connectToDatabase();

  const Announcement = getAnnouncementModel();
  const record = await Announcement.create({ announcement });

  const shopResponse = await admin.graphql(`#graphql
    query {
      shop {
        id
      }
    }
  `);

  const shopData = await shopResponse.json();
  const shopId = shopData.data.shop.id;

  const metafieldResponse = await admin.graphql(
    `#graphql
      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            key
            namespace
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        metafields: [
          {
            namespace: "my_app",
            key: "announcement",
            type: "single_line_text_field",
            value: announcement,
            ownerId: shopId,
          },
        ],
      },
    },
  );

  const metafieldData = await metafieldResponse.json();

  const userErrors = metafieldData?.data?.metafieldsSet?.userErrors;

  if (userErrors && userErrors.length > 0) {
    throw new Error(userErrors[0].message);
  }

  return record;
}
