/**
 * NOTE:
 * Do not forget to update the string set table on Docs
 * When you update this string set
 *
 * `%d` will be replaced by a proper number
 */

// TODO: Make StringSet as a interface
export type StringSet = Record<keyof typeof stringSet['en'], string>;
const stringSet = {
  en: {
    // Group Channel - Conversation
    MESSAGE_STATUS__YESTERDAY: 'Yesterday',
    CHANNEL__MESSAGE_LIST__NOTIFICATION__NEW_MESSAGE: 'new message(s) since',
    /** @deprecated Please use `DATE_FORMAT__MESSAGE_LIST__NOTIFICATION__UNREAD_SINCE` instead * */
    CHANNEL__MESSAGE_LIST__NOTIFICATION__ON: 'on',
    // Channel List
    CHANNEL_PREVIEW_MOBILE_LEAVE: 'Leave channel',
    // Group Channel - Settings
    CHANNEL_SETTING__HEADER__TITLE: 'Channel information',
    CHANNEL_SETTING__PROFILE__EDIT: 'Edit',
    CHANNEL_SETTING__MEMBERS__TITLE: 'Members',
    CHANNEL_SETTING__MEMBERS__SEE_ALL_MEMBERS: 'All members',
    CHANNEL_SETTING__MEMBERS__INVITE_MEMBER: 'Invite users',
    CHANNEL_SETTING__MEMBERS__YOU: ' (You)',
    CHANNEL_SETTING__MEMBERS__SELECT_TITLE: 'Select members',
    CHANNEL_SETTING__MEMBERS__OPERATOR: 'Operator',
    CHANNEL_SETTING__LEAVE_CHANNEL__TITLE: 'Leave channel',
    CHANNEL_SETTING__OPERATORS__TITLE: 'Operators',
    CHANNEL_SETTING__OPERATORS__TITLE_ALL: 'All operators',
    CHANNEL_SETTING__OPERATORS__TITLE_ADD: 'Add operator',
    CHANNEL_SETTING__OPERATORS__ADD_BUTTON: 'Add',
    CHANNEL_SETTING__MUTED_MEMBERS__TITLE: 'Muted members',
    CHANNEL_SETTING__MUTED_MEMBERS__TITLE_ALL: 'All muted members',
    CHANNEL_SETTING__NO_UNMUTED: 'No muted members yet',
    CHANNEL_SETTING__BANNED_MEMBERS__TITLE: 'Banned users',
    CHANNEL_SETTING__FREEZE_CHANNEL: 'Freeze Channel',
    CHANNEL_SETTING__MODERATION__REGISTER_AS_OPERATOR: 'Register as operator',
    CHANNEL_SETTING__MODERATION__UNREGISTER_OPERATOR: 'Unregister operator',
    CHANNEL_SETTING__MODERATION__MUTE: 'Mute',
    CHANNEL_SETTING__MODERATION__UNMUTE: 'Unmute',
    CHANNEL_SETTING__MODERATION__BAN: 'Ban',
    CHANNEL_SETTING__MODERATION__UNBAN: 'Unban',
    CHANNEL_SETTING__MODERATION__EMPTY_BAN: 'No banned members yet',
    CHANNEL_SETTING__MODERATION__ALL_BAN: 'All banned members',
    // OpenChannel - Conversation
    OPEN_CHANNEL_CONVERSATION__TITLE_PARTICIPANTS: 'participants',
    OPEN_CHANNEL_CONVERSATION__SELECT_PARTICIPANTS: 'Select participants',
    // OpenChannelList
    OPEN_CHANNEL_LIST__TITLE: 'Channels',
    CREATE_OPEN_CHANNEL_LIST__TITLE: 'New channel profile',
    CREATE_OPEN_CHANNEL_LIST__SUBTITLE__IMG_SECTION: 'Channel image',
    CREATE_OPEN_CHANNEL_LIST__SUBTITLE__IMG_UPLOAD: 'Upload',
    CREATE_OPEN_CHANNEL_LIST__SUBTITLE__TEXT_SECTION: 'Channel name',
    CREATE_OPEN_CHANNEL_LIST__SUBTITLE__TEXT_PLACE_HOLDER: 'Enter channel name',
    CREATE_OPEN_CHANNEL_LIST__SUBMIT: 'Create',
    // OpenChannel - Settings
    OPEN_CHANNEL_SETTINGS__OPERATOR_TITLE: 'Channel Information',
    OPEN_CHANNEL_SETTINGS__OPERATOR_URL: 'URL',
    OPEN_CHANNEL_SETTINGS__PARTICIPANTS_ACCORDION_TITLE: 'Participants',
    OPEN_CHANNEL_SETTINGS__DELETE_CHANNEL_PANEL: 'Delete channel',
    OPEN_CHANNEL_SETTINGS__DELETE_CHANNEL_TITLE: 'Delete channel?',
    OPEN_CHANNEL_SETTINGS__DELETE_CHANNEL_CONTEXT: "Once deleted, this channel can't be restored.",
    OPEN_CHANNEL_SETTINGS__DELETE_CHANNEL_SUBMIT: 'Delete',
    OPEN_CHANNEL_SETTINGS__OPERATORS_TITLE: 'Operators',
    OPEN_CHANNEL_SETTINGS__OPERATORS__TITLE_ADD: 'Add operator',
    OPEN_CHANNEL_SETTINGS__OPERATORS__TITLE_ALL: 'All operators',
    OPEN_CHANNEL_SETTINGS__MUTED_MEMBERS__TITLE: 'Muted participants',
    OPEN_CHANNEL_SETTINGS__MUTED_MEMBERS__TITLE_ALL: 'All muted participants',
    OPEN_CHANNEL_SETTINGS__MUTED_MEMBERS__NO_ONE: 'No muted participants yet',
    OPEN_CHANNEL_SETTINGS__BANNED_MEMBERS__TITLE: 'Banned users',
    OPEN_CHANNEL_SETTINGS__BANNED_MEMBERS__TITLE_ALL: 'All banned users',
    OPEN_CHANNEL_SETTINGS__BANNED_MEMBERS__NO_ONE: 'No banned users yet',
    OPEN_CHANNEL_SETTINGS__MEMBERS__YOU: ' (You)',
    OPEN_CHANNEL_SETTINGS__MEMBERS__OPERATOR: 'Operator',
    OPEN_CHANNEL_SETTINGS__PARTICIPANTS_TITLE: 'Participants',
    OPEN_CHANNEL_SETTINGS__EMPTY_LIST: 'No participants yet',
    OPEN_CHANNEL_SETTINGS__SEE_ALL: 'See all participants',
    OPEN_CHANNEL_SETTINGS__ALL_PARTICIPANTS_TITLE: 'All participants',
    OPEN_CHANNEL_SETTINGS__NO_TITLE: '(No title)',
    OPEN_CHANNEL_SETTING__MODERATION__REGISTER_AS_OPERATOR: 'Register as operator',
    OPEN_CHANNEL_SETTING__MODERATION__UNREGISTER_OPERATOR: 'Unregister operator',
    OPEN_CHANNEL_SETTING__MODERATION__MUTE: 'Mute',
    OPEN_CHANNEL_SETTING__MODERATION__UNMUTE: 'Unmute',
    OPEN_CHANNEL_SETTING__MODERATION__BAN: 'Ban',
    OPEN_CHANNEL_SETTING__MODERATION__UNBAN: 'Unban',
    // Channel - Common
    TRYING_TO_CONNECT: 'Trying to connect…',
    TYPING_INDICATOR__IS_TYPING: 'is typing...',
    TYPING_INDICATOR__AND: 'and',
    TYPING_INDICATOR__ARE_TYPING: 'are typing...',
    TYPING_INDICATOR__MULTIPLE_TYPING: 'Several people are typing...',
    CHANNEL_FROZEN: 'Channel frozen',
    PLACE_HOLDER__NO_CHANNEL: 'No channels',
    PLACE_HOLDER__WRONG: 'Something went wrong',
    PLACE_HOLDER__RETRY_TO_CONNECT: 'Retry',
    PLACE_HOLDER__NO_MESSAGES: 'No messages',
    TOOLTIP__AND_YOU: ', and you',
    TOOLTIP__YOU: 'you',
    TOOLTIP__UNKNOWN_USER: '(no name)',
    UNKNOWN__UNKNOWN_MESSAGE_TYPE: '(Unknown message type)',
    UNKNOWN__CANNOT_READ_MESSAGE: 'Cannot read this message.',
    UNKNOWN__TEMPLATE_ERROR: '(Template error)',
    UNKNOWN__CANNOT_READ_TEMPLATE: 'Cannot read this template.',
    MESSAGE_EDITED: '(edited)',
    // Channel - Modal
    MODAL__DELETE_MESSAGE__TITLE: 'Delete this message?',
    MODAL__CHANNEL_INFORMATION__TITLE: 'Edit channel information',
    MODAL__CHANNEL_INFORMATION__CHANNEL_IMAGE: 'Channel image',
    MODAL__CHANNEL_INFORMATION__UPLOAD: 'Upload',
    MODAL__CHANNEL_INFORMATION__CHANNEL_NAME: 'Channel name',
    MODAL__CHANNEL_INFORMATION__INPUT__PLACE_HOLDER: 'Enter name',
    MODAL__INVITE_MEMBER__TITLE: 'Invite member',
    MODAL__INVITE_MEMBER__SELECTED: 'selected',
    MODAL__CHOOSE_CHANNEL_TYPE__TITLE: 'New channel',
    MODAL__CHOOSE_CHANNEL_TYPE__GROUP: 'Group',
    MODAL__CHOOSE_CHANNEL_TYPE__SUPER_GROUP: 'Super group',
    MODAL__CHOOSE_CHANNEL_TYPE__BROADCAST: 'Broadcast',
    MODAL__CREATE_CHANNEL__TITLE: 'New channel',
    MODAL__CREATE_CHANNEL__GROUP: 'Group',
    MODAL__CREATE_CHANNEL__SUPER: 'Super group',
    MODAL__CREATE_CHANNEL__BROADCAST: 'Broadcast',
    MODAL__CREATE_CHANNEL__SELECTED: 'selected',
    MODAL__LEAVE_CHANNEL__TITLE: 'Leave this channel?',
    MODAL__LEAVE_CHANNEL__FOOTER: 'Leave',
    MODAL__VOICE_MESSAGE_INPUT_DISABLED__TITLE_MUTED: "You're muted by the operator.",
    MODAL__VOICE_MESSAGE_INPUT_DISABLED__TITLE_FROZEN: 'Channel is frozen.',
    // User Profile
    USER_PROFILE__MESSAGE: 'Message',
    USER_PROFILE__USER_ID: 'User ID',
    EDIT_PROFILE__TITLE: 'My profile',
    EDIT_PROFILE__IMAGE_LABEL: 'Profile image',
    EDIT_PROFILE__IMAGE_UPLOAD: 'Upload',
    EDIT_PROFILE__NICKNAME_LABEL: 'Nickname',
    EDIT_PROFILE__NICKNAME_PLACEHOLDER: 'Enter your nickname',
    EDIT_PROFILE__USERID_LABEL: 'User ID',
    EDIT_PROFILE__THEME_LABEL: 'Dark theme',
    // Message Input
    MESSAGE_INPUT__PLACE_HOLDER: 'Enter message',
    MESSAGE_INPUT__PLACE_HOLDER__DISABLED: 'Chat is unavailable in this channel',
    MESSAGE_INPUT__PLACE_HOLDER__MUTED: "Chat is unavailable because you're muted",
    MESSAGE_INPUT__PLACE_HOLDER__MUTED_SHORT: "You're muted",
    MESSAGE_INPUT__QUOTE_REPLY__PLACE_HOLDER: 'Reply to message',
    // Common UI
    BUTTON__SUBMIT: 'Submit',
    BUTTON__CANCEL: 'Cancel',
    BUTTON__DELETE: 'Delete',
    BUTTON__SAVE: 'Save',
    BUTTON__CREATE: 'Create',
    BUTTON__INVITE: 'Invite',
    BUTTON__OK: 'OK',
    BADGE__OVER: '+',
    NO_TITLE: 'No title',
    NO_NAME: '(No name)',
    NO_MEMBERS: '(No members)',
    LABEL__OPERATOR: 'Operator',
    // Context Menu
    MESSAGE_MENU__COPY: 'Copy',
    MESSAGE_MENU__REPLY: 'Reply',
    MESSAGE_MENU__THREAD: 'Reply in thread',
    MESSAGE_MENU__OPEN_IN_CHANNEL: 'Open in channel',
    MESSAGE_MENU__EDIT: 'Edit',
    MESSAGE_MENU__RESEND: 'Resend',
    MESSAGE_MENU__DELETE: 'Delete',
    MESSAGE_MENU__SAVE: 'Save',
    //  * FIXME: get back legacy, remove after refactoring open channel messages *
    CONTEXT_MENU_DROPDOWN__COPY: 'Copy',
    CONTEXT_MENU_DROPDOWN__EDIT: 'Edit',
    CONTEXT_MENU_DROPDOWN__RESEND: 'Resend',
    CONTEXT_MENU_DROPDOWN__DELETE: 'Delete',
    CONTEXT_MENU_DROPDOWN__SAVE: 'Save',
    // Feature - Message Search
    SEARCH: 'Search',
    SEARCH_IN_CHANNEL: 'Search in channel',
    SEARCH_IN: 'Search in',
    SEARCHING: 'Searching for messages...',
    NO_SEARCHED_MESSAGE: 'No results found.',
    // Feature - Message Reply
    QUOTE_MESSAGE_INPUT__REPLY_TO: 'Reply to',
    QUOTE_MESSAGE_INPUT__FILE_TYPE_IMAGE: 'Photo',
    QUOTE_MESSAGE_INPUT__FILE_TYPE_GIF: 'GIF',
    QUOTE_MESSAGE_INPUT__FILE_TYPE__VIDEO: 'Video',
    QUOTED_MESSAGE__REPLIED_TO: 'replied to',
    QUOTED_MESSAGE__CURRENT_USER: 'You',
    QUOTED_MESSAGE__UNAVAILABLE: 'Message unavailable',
    // Feature - Thread
    THREAD__HEADER_TITLE: 'Thread',
    CHANNEL__THREAD_REPLY: 'reply',
    CHANNEL__THREAD_REPLIES: 'replies',
    CHANNEL__THREAD_OVER_MAX: '99+',
    THREAD__THREAD_REPLY: 'reply',
    THREAD__THREAD_REPLIES: 'replies',
    THREAD__INPUT__REPLY_TO_THREAD: 'Reply to thread',
    THREAD__INPUT__REPLY_IN_THREAD: 'Reply in thread',
    // Feature - Mention
    MENTION_NAME__NO_NAME: '(No name)',
    MENTION_COUNT__OVER_LIMIT: 'You can mention up to %d times at a time.',
    UI__FILE_VIEWER__UNSUPPORT: 'Unsupported message',
    // Feature - Voice Message
    VOICE_RECORDING_PERMISSION_DENIED: `You cannot record the voice since
        voice recording is not permitted in your device system setting`,
    VOICE_MESSAGE: 'Voice Message',
    // Channel preview last message file type display strings
    CHANNEL_PREVIEW_LAST_MESSAGE_FILE_TYPE_GIF: 'GIF',
    CHANNEL_PREVIEW_LAST_MESSAGE_FILE_TYPE_PHOTO: 'Photo',
    CHANNEL_PREVIEW_LAST_MESSAGE_FILE_TYPE_VIDEO: 'Video',
    CHANNEL_PREVIEW_LAST_MESSAGE_FILE_TYPE_AUDIO: 'Audio',
    CHANNEL_PREVIEW_LAST_MESSAGE_FILE_TYPE_VOICE_MESSAGE: 'Voice message',
    CHANNEL_PREVIEW_LAST_MESSAGE_FILE_TYPE_GENERAL: 'File',
    CHANNEL_PREVIEW_LAST_MESSAGE_TEMPLATE_MESSAGE: 'Message',
    // Date format
    DATE_FORMAT__MESSAGE_LIST__NOTIFICATION__UNREAD_SINCE: "p 'on' MMM dd",
    DATE_FORMAT__MESSAGE_LIST__DATE_SEPARATOR: 'MMMM dd, yyyy',
    DATE_FORMAT__THREAD_LIST__DATE_SEPARATOR: 'MMM dd, yyyy',
    // File upload
    FILE_UPLOAD_NOTIFICATION__COUNT_LIMIT: 'Up to %d files can be attached.',
    FILE_UPLOAD_NOTIFICATION__SIZE_LIMIT: 'The maximum size per file is %d MB.',
    // Feedback button text
    FEEDBACK_LIKE: 'Like',
    FEEDBACK_DISLIKE: 'Dislike',
    // Mobile feedback options menu items
    EDIT_COMMENT: 'Edit comment',
    REMOVE_FEEDBACK: 'Remove Feedback',
    // Feedback modal title
    FEEDBACK_MODAL_TITLE: 'Provide additional feedback (optional)',
    FEEDBACK_CONTENT_PLACEHOLDER: 'Leave a comment',
    BUTTON__REMOVE_FEEDBACK: 'Remove feedback',
    // Feedback failed modal title
    FEEDBACK_FAILED_SUBMIT: 'Couldn’t submit. Try again.',
    FEEDBACK_FAILED_SAVE: 'Couldn’t save. Try again.',
    FEEDBACK_FAILED_DELETE: 'Couldn’t delete. Try again.',
  },
  es: {
    // Group Channel - Conversación
    MESSAGE_STATUS__YESTERDAY: 'Ayer',
    CHANNEL__MESSAGE_LIST__NOTIFICATION__NEW_MESSAGE: 'nuevo(s) mensaje(s) desde',
    /** @deprecated Por favor, usa `DATE_FORMAT__MESSAGE_LIST__NOTIFICATION__UNREAD_SINCE` en su lugar * */
    CHANNEL__MESSAGE_LIST__NOTIFICATION__ON: 'en',
    // Lista de Canales
    CHANNEL_PREVIEW_MOBILE_LEAVE: 'Salir del canal',
    // Grupo de Canales - Configuración
    CHANNEL_SETTING__HEADER__TITLE: 'Información del canal',
    CHANNEL_SETTING__PROFILE__EDIT: 'Editar',
    CHANNEL_SETTING__MEMBERS__TITLE: 'Miembros',
    CHANNEL_SETTING__MEMBERS__SEE_ALL_MEMBERS: 'Todos los miembros',
    CHANNEL_SETTING__MEMBERS__INVITE_MEMBER: 'Invitar usuarios',
    CHANNEL_SETTING__MEMBERS__YOU: ' (Tú)',
    CHANNEL_SETTING__MEMBERS__SELECT_TITLE: 'Seleccionar miembros',
    CHANNEL_SETTING__MEMBERS__OPERATOR: 'Operador',
    CHANNEL_SETTING__LEAVE_CHANNEL__TITLE: 'Salir del canal',
    CHANNEL_SETTING__OPERATORS__TITLE: 'Operadores',
    CHANNEL_SETTING__OPERATORS__TITLE_ALL: 'Todos los operadores',
    CHANNEL_SETTING__OPERATORS__TITLE_ADD: 'Agregar operador',
    CHANNEL_SETTING__OPERATORS__ADD_BUTTON: 'Agregar',
    CHANNEL_SETTING__MUTED_MEMBERS__TITLE: 'Miembros silenciados',
    CHANNEL_SETTING__MUTED_MEMBERS__TITLE_ALL: 'Todos los miembros silenciados',
    CHANNEL_SETTING__NO_UNMUTED: 'Todavía no hay miembros silenciados',
    CHANNEL_SETTING__BANNED_MEMBERS__TITLE: 'Usuarios bloqueados',
    CHANNEL_SETTING__FREEZE_CHANNEL: 'Congelar Canal',
    CHANNEL_SETTING__MODERATION__REGISTER_AS_OPERATOR: 'Registrarse como operador',
    CHANNEL_SETTING__MODERATION__UNREGISTER_OPERATOR: 'Anular registro de operador',
    CHANNEL_SETTING__MODERATION__MUTE: 'Silenciar',
    CHANNEL_SETTING__MODERATION__UNMUTE: 'Reactivar',
    CHANNEL_SETTING__MODERATION__BAN: 'Bloquear',
    CHANNEL_SETTING__MODERATION__UNBAN: 'Desbloquear',
    CHANNEL_SETTING__MODERATION__EMPTY_BAN: 'Todavía no hay miembros bloqueados',
    CHANNEL_SETTING__MODERATION__ALL_BAN: 'Todos los miembros bloqueados',
    // OpenChannel - Conversación
    OPEN_CHANNEL_CONVERSATION__TITLE_PARTICIPANTS: 'participantes',
    OPEN_CHANNEL_CONVERSATION__SELECT_PARTICIPANTS: 'Seleccionar participantes',
    // Lista de OpenChannel
    OPEN_CHANNEL_LIST__TITLE: 'Canales',
    CREATE_OPEN_CHANNEL_LIST__TITLE: 'Nuevo perfil de canal',
    CREATE_OPEN_CHANNEL_LIST__SUBTITLE__IMG_SECTION: 'Imagen del canal',
    CREATE_OPEN_CHANNEL_LIST__SUBTITLE__IMG_UPLOAD: 'Subir',
    CREATE_OPEN_CHANNEL_LIST__SUBTITLE__TEXT_SECTION: 'Nombre del canal',
    CREATE_OPEN_CHANNEL_LIST__SUBTITLE__TEXT_PLACE_HOLDER: 'Introduce el nombre del canal',
    CREATE_OPEN_CHANNEL_LIST__SUBMIT: 'Crear',
    // OpenChannel - Configuración
    OPEN_CHANNEL_SETTINGS__OPERATOR_TITLE: 'Información del canal',
    OPEN_CHANNEL_SETTINGS__OPERATOR_URL: 'URL',
    OPEN_CHANNEL_SETTINGS__PARTICIPANTS_ACCORDION_TITLE: 'Participantes',
    OPEN_CHANNEL_SETTINGS__DELETE_CHANNEL_PANEL: 'Eliminar canal',
    OPEN_CHANNEL_SETTINGS__DELETE_CHANNEL_TITLE: '¿Eliminar canal?',
    OPEN_CHANNEL_SETTINGS__DELETE_CHANNEL_CONTEXT: 'Una vez eliminado, este canal no se puede restaurar.',
    OPEN_CHANNEL_SETTINGS__DELETE_CHANNEL_SUBMIT: 'Eliminar',
    OPEN_CHANNEL_SETTINGS__OPERATORS_TITLE: 'Operadores',
    OPEN_CHANNEL_SETTINGS__OPERATORS__TITLE_ADD: 'Agregar operador',
    OPEN_CHANNEL_SETTINGS__OPERATORS__TITLE_ALL: 'Todos los operadores',
    OPEN_CHANNEL_SETTINGS__MUTED_MEMBERS__TITLE: 'Participantes silenciados',
    OPEN_CHANNEL_SETTINGS__MUTED_MEMBERS__TITLE_ALL: 'Todos los participantes silenciados',
    OPEN_CHANNEL_SETTINGS__MUTED_MEMBERS__NO_ONE: 'Todavía no hay participantes silenciados',
    OPEN_CHANNEL_SETTINGS__BANNED_MEMBERS__TITLE: 'Usuarios bloqueados',
    OPEN_CHANNEL_SETTINGS__BANNED_MEMBERS__TITLE_ALL: 'Todos los usuarios bloqueados',
    OPEN_CHANNEL_SETTINGS__BANNED_MEMBERS__NO_ONE: 'Todavía no hay usuarios bloqueados',
    OPEN_CHANNEL_SETTINGS__MEMBERS__YOU: ' (Tú)',
    OPEN_CHANNEL_SETTINGS__MEMBERS__OPERATOR: 'Operador',
    OPEN_CHANNEL_SETTINGS__PARTICIPANTS_TITLE: 'Participantes',
    OPEN_CHANNEL_SETTINGS__EMPTY_LIST: 'Todavía no hay participantes',
    OPEN_CHANNEL_SETTINGS__SEE_ALL: 'Ver todos los participantes',
    OPEN_CHANNEL_SETTINGS__ALL_PARTICIPANTS_TITLE: 'Todos los participantes',
    OPEN_CHANNEL_SETTINGS__NO_TITLE: '(Sin título)',
    OPEN_CHANNEL_SETTING__MODERATION__REGISTER_AS_OPERATOR: 'Registrarse como operador',
    OPEN_CHANNEL_SETTING__MODERATION__UNREGISTER_OPERATOR: 'Anular registro de operador',
    OPEN_CHANNEL_SETTING__MODERATION__MUTE: 'Silenciar',
    OPEN_CHANNEL_SETTING__MODERATION__UNMUTE: 'Reactivar',
    OPEN_CHANNEL_SETTING__MODERATION__BAN: 'Bloquear',
    OPEN_CHANNEL_SETTING__MODERATION__UNBAN: 'Desbloquear',
    // Canal - Común
    TRYING_TO_CONNECT: 'Intentando conectar...',
    TYPING_INDICATOR__IS_TYPING: 'está escribiendo...',
    TYPING_INDICATOR__AND: 'y',
    TYPING_INDICATOR__ARE_TYPING: 'están escribiendo...',
    TYPING_INDICATOR__MULTIPLE_TYPING: 'Varias personas están escribiendo...',
    CHANNEL_FROZEN: 'Canal congelado',
    PLACE_HOLDER__NO_CHANNEL: 'Sin canales',
    PLACE_HOLDER__WRONG: 'Algo salió mal',
    PLACE_HOLDER__RETRY_TO_CONNECT: 'Reintentar',
    PLACE_HOLDER__NO_MESSAGES: 'Sin mensajes',
    TOOLTIP__AND_YOU: ', y tú',
    TOOLTIP__YOU: 'tú',
    TOOLTIP__UNKNOWN_USER: '(sin nombre)',
    UNKNOWN__UNKNOWN_MESSAGE_TYPE: '(Tipo de mensaje desconocido)',
    UNKNOWN__CANNOT_READ_MESSAGE: 'No se puede leer este mensaje.',
    UNKNOWN__TEMPLATE_ERROR: '(Error de plantilla)',
    UNKNOWN__CANNOT_READ_TEMPLATE: 'No se puede leer esta plantilla.',
    MESSAGE_EDITED: '(editado)',
    // Modal de Canal
    MODAL__DELETE_MESSAGE__TITLE: '¿Eliminar este mensaje?',
    MODAL__CHANNEL_INFORMATION__TITLE: 'Editar información del canal',
    MODAL__CHANNEL_INFORMATION__CHANNEL_IMAGE: 'Imagen del canal',
    MODAL__CHANNEL_INFORMATION__UPLOAD: 'Subir',
    MODAL__CHANNEL_INFORMATION__CHANNEL_NAME: 'Nombre del canal',
    MODAL__CHANNEL_INFORMATION__INPUT__PLACE_HOLDER: 'Introduce el nombre',
    MODAL__INVITE_MEMBER__TITLE: 'Invitar miembro',
    MODAL__INVITE_MEMBER__SELECTED: 'seleccionado',
    MODAL__CHOOSE_CHANNEL_TYPE__TITLE: 'Nuevo canal',
    MODAL__CHOOSE_CHANNEL_TYPE__GROUP: 'Grupo',
    MODAL__CHOOSE_CHANNEL_TYPE__SUPER_GROUP: 'Supergrupo',
    MODAL__CHOOSE_CHANNEL_TYPE__BROADCAST: 'Transmisión',
    MODAL__CREATE_CHANNEL__TITLE: 'Nuevo canal',
    MODAL__CREATE_CHANNEL__GROUP: 'Grupo',
    MODAL__CREATE_CHANNEL__SUPER: 'Supergrupo',
    MODAL__CREATE_CHANNEL__BROADCAST: 'Transmisión',
    MODAL__CREATE_CHANNEL__SELECTED: 'seleccionado',
    MODAL__LEAVE_CHANNEL__TITLE: '¿Salir de este canal?',
    MODAL__LEAVE_CHANNEL__FOOTER: 'Salir',
    MODAL__VOICE_MESSAGE_INPUT_DISABLED__TITLE_MUTED: 'Estás silenciado por el operador.',
    MODAL__VOICE_MESSAGE_INPUT_DISABLED__TITLE_FROZEN: 'El canal está congelado.',
    // Perfil de Usuario
    USER_PROFILE__MESSAGE: 'Mensaje',
    USER_PROFILE__USER_ID: 'ID de usuario',
    EDIT_PROFILE__TITLE: 'Mi perfil',
    EDIT_PROFILE__IMAGE_LABEL: 'Imagen de perfil',
    EDIT_PROFILE__IMAGE_UPLOAD: 'Subir',
    EDIT_PROFILE__NICKNAME_LABEL: 'Apodo',
    EDIT_PROFILE__NICKNAME_PLACEHOLDER: 'Introduce tu apodo',
    EDIT_PROFILE__USERID_LABEL: 'ID de usuario',
    EDIT_PROFILE__THEME_LABEL: 'Tema oscuro',
    // Entrada de Mensajes
    MESSAGE_INPUT__PLACE_HOLDER: 'Escribe tu mensaje',
    MESSAGE_INPUT__PLACE_HOLDER__DISABLED: 'El chat no está disponible en este canal',
    MESSAGE_INPUT__PLACE_HOLDER__MUTED: 'El chat no está disponible porque estás silenciado',
    MESSAGE_INPUT__PLACE_HOLDER__MUTED_SHORT: 'Estás silenciado',
    MESSAGE_INPUT__QUOTE_REPLY__PLACE_HOLDER: 'Responder al mensaje',
    // Interfaz de Usuario Común
    BUTTON__SUBMIT: 'Enviar',
    BUTTON__CANCEL: 'Cancelar',
    BUTTON__DELETE: 'Eliminar',
    BUTTON__SAVE: 'Guardar',
    BUTTON__CREATE: 'Crear',
    BUTTON__INVITE: 'Invitar',
    BUTTON__OK: 'Aceptar',
    BADGE__OVER: '+',
    NO_TITLE: 'Sin título',
    NO_NAME: '(Sin nombre)',
    NO_MEMBERS: 'Chat eliminado',
    LABEL__OPERATOR: 'Operador',
    // Menú Contextual
    MESSAGE_MENU__COPY: 'Copiar',
    MESSAGE_MENU__REPLY: 'Responder',
    MESSAGE_MENU__THREAD: 'Responder en hilo',
    MESSAGE_MENU__OPEN_IN_CHANNEL: 'Abrir en el canal',
    MESSAGE_MENU__EDIT: 'Editar',
    MESSAGE_MENU__RESEND: 'Reenviar',
    MESSAGE_MENU__DELETE: 'Eliminar',
    MESSAGE_MENU__SAVE: 'Guardar',
    //  * AVISO: recuperar legado, eliminar después de refactorizar los mensajes del canal abierto *
    CONTEXT_MENU_DROPDOWN__COPY: 'Copiar',
    CONTEXT_MENU_DROPDOWN__EDIT: 'Editar',
    CONTEXT_MENU_DROPDOWN__RESEND: 'Reenviar',
    CONTEXT_MENU_DROPDOWN__DELETE: 'Eliminar',
    CONTEXT_MENU_DROPDOWN__SAVE: 'Guardar',
    // Funcionalidad - Búsqueda de Mensajes
    SEARCH: 'Buscar',
    SEARCH_IN_CHANNEL: 'Buscar en el canal',
    SEARCH_IN: 'Buscar en',
    SEARCHING: 'Buscando mensajes...',
    NO_SEARCHED_MESSAGE: 'No se encontraron resultados.',
    // Funcionalidad - Respuesta de Mensajes
    QUOTE_MESSAGE_INPUT__REPLY_TO: 'Responder a',
    QUOTE_MESSAGE_INPUT__FILE_TYPE_IMAGE: 'Foto',
    QUOTE_MESSAGE_INPUT__FILE_TYPE_GIF: 'GIF',
    QUOTE_MESSAGE_INPUT__FILE_TYPE__VIDEO: 'Video',
    QUOTED_MESSAGE__REPLIED_TO: 'respondió a',
    QUOTED_MESSAGE__CURRENT_USER: 'Tú',
    QUOTED_MESSAGE__UNAVAILABLE: 'Mensaje no disponible',
    // Funcionalidad - Hilo
    THREAD__HEADER_TITLE: 'Hilo',
    CHANNEL__THREAD_REPLY: 'respuesta',
    CHANNEL__THREAD_REPLIES: 'respuestas',
    CHANNEL__THREAD_OVER_MAX: '99+',
    THREAD__THREAD_REPLY: 'respuesta',
    THREAD__THREAD_REPLIES: 'respuestas',
    THREAD__INPUT__REPLY_TO_THREAD: 'Responder al hilo',
    THREAD__INPUT__REPLY_IN_THREAD: 'Responder en el hilo',
    // Funcionalidad - Mención
    MENTION_NAME__NO_NAME: '(Sin nombre)',
    MENTION_COUNT__OVER_LIMIT: 'Puedes mencionar hasta %d veces a la vez.',
    UI__FILE_VIEWER__UNSUPPORT: 'Mensaje no compatible',
    // Funcionalidad - Mensaje de Voz
    VOICE_RECORDING_PERMISSION_DENIED: `No puedes grabar la voz ya que
        la grabación de voz no está permitida en la configuración del sistema de tu dispositivo`,
    VOICE_MESSAGE: 'Mensaje de Voz',
    // Tipos de archivos del último mensaje en la vista previa del canal
    CHANNEL_PREVIEW_LAST_MESSAGE_FILE_TYPE_GIF: 'GIF',
    CHANNEL_PREVIEW_LAST_MESSAGE_FILE_TYPE_PHOTO: 'Foto',
    CHANNEL_PREVIEW_LAST_MESSAGE_FILE_TYPE_VIDEO: 'Video',
    CHANNEL_PREVIEW_LAST_MESSAGE_FILE_TYPE_AUDIO: 'Audio',
    CHANNEL_PREVIEW_LAST_MESSAGE_FILE_TYPE_VOICE_MESSAGE: 'Mensaje de voz',
    CHANNEL_PREVIEW_LAST_MESSAGE_FILE_TYPE_GENERAL: 'Archivo',
    CHANNEL_PREVIEW_LAST_MESSAGE_TEMPLATE_MESSAGE: 'Mensaje',
    // Formato de Fecha
    DATE_FORMAT__MESSAGE_LIST__NOTIFICATION__UNREAD_SINCE: "p 'el' MMM dd",
    DATE_FORMAT__MESSAGE_LIST__DATE_SEPARATOR: 'dd MMMM, yyyy',
    DATE_FORMAT__THREAD_LIST__DATE_SEPARATOR: 'dd MMMM, yyyy',
    // Subida de Archivos
    FILE_UPLOAD_NOTIFICATION__COUNT_LIMIT: 'Se pueden adjuntar hasta %d archivos.',
    FILE_UPLOAD_NOTIFICATION__SIZE_LIMIT: 'El tamaño máximo por archivo es de %d MB.',
    // Botones de Retroalimentación
    FEEDBACK_LIKE: 'Me gusta',
    FEEDBACK_DISLIKE: 'No me gusta',
    // Elementos de menú de opciones móviles de retroalimentación
    EDIT_COMMENT: 'Editar comentario',
    REMOVE_FEEDBACK: 'Eliminar retroalimentación',
    // Título del modal de retroalimentación
    FEEDBACK_MODAL_TITLE: 'Proporcionar retroalimentación adicional (opcional)',
    FEEDBACK_CONTENT_PLACEHOLDER: 'Deja un comentario',
    BUTTON__REMOVE_FEEDBACK: 'Eliminar retroalimentación',
    // Título del modal de retroalimentación fallida
    FEEDBACK_FAILED_SUBMIT: 'No se pudo enviar. Inténtalo de nuevo.',
    FEEDBACK_FAILED_SAVE: 'No se pudo guardar. Inténtalo de nuevo.',
    FEEDBACK_FAILED_DELETE: 'No se pudo eliminar. Inténtalo de nuevo.',
  },
};

const getStringSet = (lang: 'en' | 'es'): StringSet => {
  return stringSet[lang];
};

export default getStringSet;
