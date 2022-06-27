$minAccessLevel = 'lands-department-manager';
return Auth('memberof', $minAccessLevel, 'group');