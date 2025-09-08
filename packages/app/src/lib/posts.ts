export function calendarEventForPost(post: any) {
  return {
    title: post.text || 'No Content',
    start: post.scheduleTime,
    channel: post.channel,
    images: post.medias,
    allDay: false,
  };
}
