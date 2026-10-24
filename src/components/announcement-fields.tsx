export function AnnouncementFields({content}:{content:Record<string,unknown>}) {
  const a = content['announcement'] && typeof content['announcement'] === 'object' ? content['announcement'] as Record<string,unknown> : {};
  return <fieldset className="span-two admin-subform"><legend>Top announcement</legend><div className="form-grid">
    <label className="span-two">Announcement text<textarea name="announcement_text" defaultValue={String(a['text']??'')}/></label>
    <label>Link label<input name="announcement_label" defaultValue={String(a['label']??'')}/></label>
    <label>Link URL<input name="announcement_path" defaultValue={String(a['path']??'')} pattern="(/[^/].*|/|https://.*)"/></label>
    <label className="span-two"><span><input name="announcement_active" type="checkbox" defaultChecked={a['active']===true}/> Show announcement</span></label>
  </div></fieldset>;
}