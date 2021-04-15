const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  query: `
    sigBySlug(id: ID slug: String): Sig
  `,
  resolver: {
    Query: {
      sigBySlug: {
        resolverOf: "Sig.findOne",
        async resolver(_, { slug }, { context: ctx }) {
          const entity = await strapi.services.sig.findOne({ slug });

          const entitySanitized = sanitizeEntity(entity, {
            model: strapi.models.sig,
          });

          if (entity.security == "public") return entitySanitized;

          const userId = ctx.state?.user?.id;

          const userCanView = entity.usersCanView
            .map((user) => user.id)
            .includes(userId);

          if (userCanView) return entitySanitized;

          return ctx.unauthorized(`You can't view this Sig`);
        },
      },
    },
  },
};
