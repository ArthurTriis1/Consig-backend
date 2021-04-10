"use strict";

const { sanitizeEntity, parseMultipartData } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async findOne(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.sig.findOne({ id });

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

  async update(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.sig.findOne({ id });

    const userId = ctx.state?.user?.id;

    const usersCanEdit = entity.usersCanEdit
      .map((user) => user.id)
      .includes(userId);

    if (!usersCanEdit) return ctx.unauthorized(`You can't update this Sig`);

    let sig;

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      sig = await strapi.services.restaurant.update({ id }, data, {
        files,
      });
    } else {
      sig = await strapi.services.restaurant.update({ id }, ctx.request.body);
    }

    return sanitizeEntity(sig, { model: strapi.models.sig });
  },

  async basic(ctx) {
    const { slug } = ctx.params;

    const entity = await strapi.services.sig.findOne({ slug });

    if (!entity) {
      return ctx.throw(404, "Sig não encontrado");
    }

    const sig = {
      data: {
        name: entity.name,
        security: entity.security,
        id: entity.id,
      },
      theme: entity.theme,
    };

    return sanitizeEntity(sig, { model: strapi.models.sig });
  },
};
