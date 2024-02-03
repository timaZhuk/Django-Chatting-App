from django import template

register = template.Library()

@register.filter(name='initials')
def initials(value):
    # accumulate our initials Tim Berton -- TB
    initials = ''

    # loop throug the name = 'Tim Berton'
    for name in value.split(' '):
        # we don't want our initial where longer than 3 characters
        if name and len(initials) < 3:
            initials +=name[0].upper()
            
    return initials
